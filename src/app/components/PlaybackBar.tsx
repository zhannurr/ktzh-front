import { useState, useEffect, useRef, useCallback } from 'react';
import { getTelemetryHistory } from '@/api';
import type { TelemetryHistoryItem, TelemetryResolution } from '@/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaybackBarProps {
  /** Locomotive ID used to fetch history (e.g. "kz8a", "te33a") */
  locomotiveId: string;
  /** Called when the user scrubs or playback advances — null = LIVE mode */
  onFrameChange: (frame: TelemetryHistoryItem | null) => void;
}

type PlayState = 'live' | 'paused' | 'playing';

const RESOLUTIONS: { label: string; value: TelemetryResolution; windowMs: number }[] = [
  // { label: '5 мин',  value: 'raw', windowMs: 5  * 60 * 1000 },
  { label: '5 мин',    value: '5m',  windowMs: 2  * 60 * 60 * 1000 },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Sparkline mini-chart (speed/health along the timeline)
// ---------------------------------------------------------------------------

function SparkPath({ data, width, height, key: _key }: { data: number[]; width: number; height: number; key?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  return (
    <polyline
      points={pts.join(' ')}
      fill="none"
      stroke="var(--dash-gold)"
      strokeWidth="1.5"
      strokeOpacity="0.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PlaybackBar({ locomotiveId, onFrameChange }: PlaybackBarProps) {
  const [resIdx, setResIdx] = useState(0);
  const resolution = RESOLUTIONS[resIdx];

  const [history, setHistory] = useState<TelemetryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<number>(1); // 0–1 fraction
  const [playState, setPlayState] = useState<PlayState>('live');
  const [speed, setSpeed] = useState(1); // playback speed multiplier
  const [barWidth, setBarWidth] = useState(0);

  const barRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -------------------------------------------------------------------------
  // Measure bar width for accurate click position
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!barRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setBarWidth(entries[0].contentRect.width);
    });
    ro.observe(barRef.current);
    setBarWidth(barRef.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // -------------------------------------------------------------------------
  // Fetch history
  // -------------------------------------------------------------------------
  const fetchHistory = useCallback(async () => {
    if (!locomotiveId) return;
    setLoading(true);
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - resolution.windowMs).toISOString();
      const data = await getTelemetryHistory(locomotiveId, from, to, resolution.value);
      setHistory(data);
    } catch {
      // no data yet
    } finally {
      setLoading(false);
    }
  }, [locomotiveId, resolution.value, resolution.windowMs]);

  // Re-fetch when route or resolution changes
  useEffect(() => {
    setHistory([]);
    void fetchHistory();
    // In LIVE mode refresh history every 10 seconds
    fetchTimerRef.current = setInterval(() => {
      if (playState === 'live') void fetchHistory();
    }, 10_000);
    return () => { if (fetchTimerRef.current) clearInterval(fetchTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locomotiveId, resIdx]);

  // -------------------------------------------------------------------------
  // Playback tick
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    if (playState !== 'playing' || history.length < 2) return;

    const step = 1 / (history.length - 1); // advance by one frame per tick
    const intervalMs = Math.max(100, 1000 / speed);

    playTimerRef.current = setInterval(() => {
      setCursor((prev) => {
        const next = prev + step;
        if (next >= 1) {
          // Reached end — switch to LIVE
          setPlayState('live');
          onFrameChange(null);
          return 1;
        }
        return next;
      });
    }, intervalMs);

    return () => { if (playTimerRef.current) clearInterval(playTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playState, history.length, speed]);

  // -------------------------------------------------------------------------
  // Emit frame when cursor changes (not in LIVE mode)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (playState === 'live' || history.length === 0) {
      onFrameChange(null);
      return;
    }
    const idx = Math.min(Math.round(cursor * (history.length - 1)), history.length - 1);
    onFrameChange(history[idx] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, playState, history]);

  // -------------------------------------------------------------------------
  // Drag/click on timeline
  // -------------------------------------------------------------------------
  const handleBarInteraction = useCallback((clientX: number) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCursor(frac);
    if (playState === 'live') setPlayState('paused');
  }, [playState]);

  const handleMouseDown = (e: React.MouseEvent) => {
    handleBarInteraction(e.clientX);
    const move = (me: MouseEvent) => handleBarInteraction(me.clientX);
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleBarInteraction(touch.clientX);
  };

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------
  const handlePlayPause = () => {
    if (playState === 'live') {
      setPlayState('paused');
    } else if (playState === 'paused') {
      if (cursor >= 1) setCursor(0);
      setPlayState('playing');
    } else {
      setPlayState('paused');
    }
  };

  const handleGoLive = () => {
    setPlayState('live');
    setCursor(1);
    onFrameChange(null);
    void fetchHistory();
  };

  const handleSkip = (direction: -1 | 1) => {
    if (history.length < 2) return;
    const step = 5 / (history.length - 1); // 5 frames
    setCursor((prev) => Math.max(0, Math.min(1, prev + direction * step)));
    if (playState === 'live') setPlayState('paused');
  };

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const cursorIdx = history.length > 0
    ? Math.min(Math.round(cursor * (history.length - 1)), history.length - 1)
    : -1;
  const cursorFrame = cursorIdx >= 0 ? history[cursorIdx] : null;
  const firstTs = history[0]?.timestamp;
  const lastTs = history[history.length - 1]?.timestamp;

  const speedValues = [1, 2, 4];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      style={{
        border: '0.5px solid var(--dash-border)',
        borderRadius: 12,
        padding: '12px 16px',
        marginTop: 12,
        backgroundColor: 'var(--dash-bg-card)',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Resolution tabs */}
          {RESOLUTIONS.map((r, i) => (
            <button
              key={r.label}
              onClick={() => { setResIdx(i); setCursor(1); setPlayState('live'); }}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                border: `1px solid ${resIdx === i ? 'var(--dash-gold)' : 'var(--dash-border)'}`,
                backgroundColor: resIdx === i ? 'rgba(240,192,64,0.12)' : 'transparent',
                color: resIdx === i ? 'var(--dash-gold)' : 'var(--dash-text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.1s',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Playback speed */}
          {playState !== 'live' && (
            <div style={{ display: 'flex', gap: 3 }}>
              {speedValues.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: 4,
                    border: `1px solid ${speed === s ? 'var(--dash-gold)' : 'var(--dash-border)'}`,
                    backgroundColor: speed === s ? 'rgba(240,192,64,0.12)' : 'transparent',
                    color: speed === s ? 'var(--dash-gold)' : 'var(--dash-text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}

          {/* LIVE badge / Go Live button */}
          {playState !== 'live' ? (
            <button
              onClick={handleGoLive}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid rgba(34,197,94,0.4)',
                backgroundColor: 'rgba(34,197,94,0.08)',
                color: 'var(--dash-status-ok)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              → LIVE
            </button>
          ) : (
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid rgba(34,197,94,0.4)',
              backgroundColor: 'rgba(34,197,94,0.08)',
              color: 'var(--dash-status-ok)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--dash-status-ok)', animation: 'pulse 2s infinite' }} />
              LIVE
            </div>
          )}
        </div>
      </div>

      {/* Timeline bar */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        {/* Sparkline background */}
        {history.length > 1 && barWidth > 0 && (
          <svg
            width={barWidth}
            height={20}
            style={{ position: 'absolute', top: -20, left: 0, pointerEvents: 'none' }}
          >
            <SparkPath
              data={history.map((f) => f.speed)}
              width={barWidth}
              height={20}
            />
          </svg>
        )}

        {/* Track */}
        <div
          ref={barRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'relative',
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(156,163,175,0.2)',
            cursor: history.length > 0 ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          {/* Played portion */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              borderRadius: 3,
              backgroundColor: playState === 'live' ? 'var(--dash-status-ok)' : 'var(--dash-gold)',
              width: `${cursor * 100}%`,
              transition: playState === 'playing' ? 'width 0.1s linear' : 'none',
            }}
          />

          {/* Playhead handle */}
          {history.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${cursor * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: playState === 'live' ? 'var(--dash-status-ok)' : 'var(--dash-gold)',
                border: '2px solid var(--dash-bg-card)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                cursor: 'grab',
                transition: playState === 'playing' ? 'left 0.1s linear' : 'none',
                zIndex: 2,
              }}
            />
          )}
        </div>

        {/* Time labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: 'var(--dash-text-muted)', fontFamily: 'monospace' }}>
            {firstTs ? fmtShort(firstTs) : '—'}
          </span>
          {loading && (
            <span style={{ fontSize: 9, color: 'var(--dash-text-muted)' }}>загрузка…</span>
          )}
          {!loading && history.length === 0 && (
            <span style={{ fontSize: 9, color: 'var(--dash-text-muted)' }}>нет данных</span>
          )}
          <span style={{ fontSize: 9, color: 'var(--dash-text-muted)', fontFamily: 'monospace' }}>
            {lastTs ? fmtShort(lastTs) : '—'}
          </span>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Current frame timestamp */}
        <div style={{ fontSize: 11, color: 'var(--dash-text-secondary)', fontFamily: 'monospace', minWidth: 70 }}>
          {playState === 'live'
            ? new Date().toLocaleTimeString('ru-RU')
            : cursorFrame
              ? fmt(cursorFrame.timestamp)
              : '—'}
        </div>

        {/* Playback controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Skip back */}
          <button
            onClick={() => handleSkip(-1)}
            disabled={history.length === 0}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '1px solid var(--dash-border)',
              backgroundColor: 'transparent',
              color: 'var(--dash-text-secondary)',
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: history.length === 0 ? 0.3 : 1,
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            disabled={history.length === 0}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: 'none',
              backgroundColor: history.length === 0 ? 'rgba(240,192,64,0.3)' : 'var(--dash-gold)',
              color: '#000',
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(240,192,64,0.3)',
              transition: 'transform 0.1s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (history.length > 0) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            {playState === 'playing' ? (
              /* Pause icon */
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              /* Play icon */
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 2 }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Skip forward */}
          <button
            onClick={() => handleSkip(1)}
            disabled={history.length === 0}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '1px solid var(--dash-border)',
              backgroundColor: 'transparent',
              color: 'var(--dash-text-secondary)',
              cursor: history.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: history.length === 0 ? 0.3 : 1,
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14 5.5 3.64L8 17.14V9.86zM16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        {/* Frame info */}
        <div style={{ fontSize: 10, color: 'var(--dash-text-muted)', textAlign: 'right', minWidth: 70 }}>
          {cursorIdx >= 0 && history.length > 0
            ? `${cursorIdx + 1} / ${history.length}`
            : `${history.length} кадр.`}
        </div>
      </div>

      {/* Historical frame info strip (visible when not LIVE) */}
      {playState !== 'live' && cursorFrame && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(240,192,64,0.06)',
            border: '1px solid rgba(240,192,64,0.2)',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Chip label="Скорость" value={`${cursorFrame.speed.toFixed(1)} км/ч`} />
          <Chip label="Здоровье" value={`${cursorFrame.health_index.toFixed(1)}%`} />
          <Chip label="Состояние" value={cursorFrame.state} />
        </div>
      )}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--dash-text-muted)' }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dash-gold)', fontFamily: 'monospace' }}>
        {value}
      </span>
    </div>
  );
}
