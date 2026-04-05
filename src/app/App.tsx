// Dashboard App — wired to FastAPI backend
import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { MetricCell } from './components/MetricCell';
import { FactorRow } from './components/FactorRow';
import { ParamRow } from './components/ParamRow';
import { AIPanel } from './components/AIPanel';
import { RouteMap } from './components/RouteMap';
import { CircularGauge } from './components/CircularGauge';
import { ArcGauge } from './components/ArcGauge';
import { PredictiveAlertStrip } from './components/PredictiveAlertStrip';
import { ChatDrawer } from './components/ChatDrawer';
import { TabBar } from './components/TabBar';
import { MotorDetailCard } from './components/MotorDetailCard';
import { EventCard } from './components/EventCard';
import { RouteDropdown } from './components/RouteDropdown';
import { CreateRouteModal } from './components/CreateRouteModal';

import {
  getLocomotives,
  getRoutes,
  getLatestTelemetry,
  getTelemetryHistory,
  getRouteTelemetryExportUrl,
  generateTelemetryForRoute,
  connectRouteWebSocket,
} from '@/api';
import type {
  LocomotiveInfo,
  RouteInfo,
  TelemetryHistoryItem,
  TelemetryFrame,
} from '@/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps backend locomotive id → human-friendly display name */
function displayName(info: LocomotiveInfo): string {
  return info.name;
}

/** Maps backend state string → UI status */
function toStatus(state: string | null): 'ok' | 'warn' | 'critical' {
  if (!state) return 'ok';
  if (state === 'fault') return 'critical';
  if (state === 'maintenance') return 'warn';
  return 'ok';
}

// ---------------------------------------------------------------------------
// Types used internally by UI
// ---------------------------------------------------------------------------

interface LocoViewModel {
  id: string;
  name: string;
  type: string;
  status: 'ok' | 'warn' | 'critical';
  healthIndex: number;
  speed: number;
  hasAlert: boolean;
  route?: RouteInfo;
}

// ---------------------------------------------------------------------------
// Loading / Error UI
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: 'var(--dash-bg-page)',
        color: 'var(--dash-text-secondary)',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(240,192,64,0.3)',
          borderTopColor: 'var(--dash-gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 14 }}>Подключение к бэкенду…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        backgroundColor: 'var(--dash-bg-page)',
        color: 'var(--dash-text-secondary)',
        fontFamily: 'Manrope, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <svg
        style={{ color: '#ef4444' }}
        width={40}
        height={40}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <div style={{ color: '#ef4444', fontSize: 14, maxWidth: 360 }}>{message}</div>
      <button
        onClick={onRetry}
        style={{
          padding: '8px 20px',
          borderRadius: 8,
          border: '1px solid var(--dash-border)',
          backgroundColor: 'var(--dash-bg-card)',
          color: 'var(--dash-text-primary)',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        Повторить
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection status badge
// ---------------------------------------------------------------------------

type ConnStatus = 'connecting' | 'live' | 'polling' | 'error';

function ConnectionBadge({ status, latency }: { status: ConnStatus; latency?: number }) {
  const label =
    status === 'live'
      ? 'LIVE'
      : status === 'polling'
        ? 'POLLING'
        : status === 'connecting'
          ? '…'
          : 'OFFLINE';

  const color =
    status === 'live'
      ? 'var(--dash-status-ok)'
      : status === 'polling'
        ? 'var(--dash-status-warn)'
        : status === 'connecting'
          ? 'var(--dash-text-muted)'
          : '#ef4444';

  return (
    <div
      className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border"
      style={{
        backgroundColor: `${color}18`,
        borderColor: color,
        borderWidth: '0.5px',
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`,
          animation: status === 'live' ? 'pulse 2s infinite' : 'none',
        }}
      />
      <span className="text-xs font-bold" style={{ color }}>
        {label}
      </span>
      {latency !== undefined && status === 'live' && (
        <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--dash-text-muted)' }}>
          {latency}ms
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard (needs data already loaded)
// ---------------------------------------------------------------------------

interface DashboardProps {
  locos: LocoViewModel[];
  routes: RouteInfo[];
  onRouteCreated: (route: RouteInfo) => void;
}

function Dashboard({ locos, routes: initialRoutes, onRouteCreated }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('ru-RU'),
  );
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showPredictiveAlert, setShowPredictiveAlert] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertExpanded, setAlertExpanded] = useState(false);

  // All routes (mutated when user adds a new one)
  const [routes, setRoutes] = useState<RouteInfo[]>(initialRoutes);

  // Selected route from dropdown
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(initialRoutes[0] ?? null);

  // Keep selectedLoco in sync with selected route's locomotive_type
  const selectedLoco = locos.find((l) => l.id === selectedRoute?.locomotive_type) ?? locos[0];

  const [telemetry, setTelemetry] = useState<TelemetryHistoryItem | null>(null);
  const [connStatus, setConnStatus] = useState<ConnStatus>('connecting');
  const [latency, setLatency] = useState<number | undefined>();

  // History events (last 20)
  const [historyEvents, setHistoryEvents] = useState<TelemetryHistoryItem[]>([]);

  // Refs for cleanup
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When routes list updates (e.g. new route created), update selectedRoute if none selected
  useEffect(() => {
    if (!selectedRoute && routes.length > 0) {
      setSelectedRoute(routes[0]);
    }
  }, [routes, selectedRoute]);

  // Clock tick
  useEffect(() => {
    const id = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString('ru-RU')),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  // -------------------------------------------------------------------------
  // Fetch latest telemetry + subscribe via WebSocket
  // Keyed on selectedRoute.id so switching route resets everything
  // -------------------------------------------------------------------------
  const locoId = selectedRoute?.locomotive_type ?? selectedLoco?.id ?? '';
  const routeId = selectedRoute?.id ?? '';

  const fetchLatest = useCallback(async () => {
    if (!locoId) return;
    try {
      const start = Date.now();
      const data = await getLatestTelemetry(locoId);
      setLatency(Date.now() - start);
      setTelemetry(data);
      setConnStatus((prev) => (prev === 'connecting' ? 'polling' : prev));
    } catch {
      // 404 = no data yet, keep polling
    }
  }, [locoId]);

  const fetchHistory = useCallback(async () => {
    if (!locoId) return;
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const data = await getTelemetryHistory(locoId, from, to, 'raw');
      setHistoryEvents(data.slice(-20).reverse());
    } catch {
      // ignore
    }
  }, [locoId]);

  useEffect(() => {
    // Reset on route change
    setTelemetry(null);
    setConnStatus('connecting');
    setLatency(undefined);

    wsCleanupRef.current?.();
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (!routeId) return;

    // Try WebSocket on the selected route
    wsCleanupRef.current = connectRouteWebSocket(
      routeId,
      (raw: unknown) => {
        const frame = raw as TelemetryFrame;
        setTelemetry({
          timestamp: frame.timestamp,
          speed: frame.speed,
          health_index: frame.health_index,
          state: frame.state,
          parameters: frame.parameters,
        });
        setConnStatus('live');
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      },
      (wsStatus: 'open' | 'closed' | 'error') => {
        if (wsStatus === 'open') setConnStatus('live');
        if (wsStatus === 'closed' || wsStatus === 'error') {
          setConnStatus('polling');
        }
      },
    );

    // Seed: generate a first frame so the simulator wakes up and DB has data
    // This calls POST /api/routes/{id}/generate which stores one frame immediately
    const seedAndPoll = async () => {
      try {
        await generateTelemetryForRoute(routeId);
      } catch {
        // ignore if route not found or already running
      }
      // After seeding, fetch latest and start polling
      void fetchLatest();
      void fetchHistory();
      pollingRef.current = setInterval(() => void fetchLatest(), 2000);
    };

    void seedAndPoll();

    return () => {
      wsCleanupRef.current?.();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  // -------------------------------------------------------------------------
  // Derived display values (real data or fallback to ViewModel defaults)
  // -------------------------------------------------------------------------
  const liveSpeed = telemetry?.speed ?? selectedLoco.speed;
  const liveHealth = telemetry?.health_index ?? selectedLoco.healthIndex;
  const liveState = telemetry?.state ?? null;
  const liveStatus = toStatus(liveState);

  // -------------------------------------------------------------------------
  // Export CSV
  // -------------------------------------------------------------------------
  const exportHistoryCSV = () => {
    if (selectedRoute) {
      const from = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const url = getRouteTelemetryExportUrl(selectedRoute.id, from);
      window.open(url, '_blank');
    } else {
      const csvContent = [
        ['Время', 'Скорость (км/ч)', 'Индекс здоровья', 'Состояние'],
        ...historyEvents.map((e) => [
          new Date(e.timestamp).toLocaleTimeString('ru-RU'),
          e.speed.toFixed(1),
          e.health_index.toFixed(1),
          e.state,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    }
  };

  // Derived display
  const stationList = selectedRoute
    ? [selectedRoute.from_city, selectedRoute.to_city]
    : ['-', '-'];

  return (
    <div
      className="min-h-screen overflow-y-auto p-2 sm:p-4"
      style={{
        backgroundColor: 'var(--dash-bg-page)',
        color: 'var(--dash-text-primary)',
        fontFamily:
          'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Bar */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b"
        style={{ borderColor: 'var(--dash-border)', borderBottomWidth: '0.5px' }}
      >
        {/* Left: status + loco name */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                liveStatus === 'ok' ? 'var(--dash-status-ok)'
                : liveStatus === 'warn' ? 'var(--dash-status-warn)'
                : '#ef4444',
              boxShadow: `0 0 6px ${
                liveStatus === 'ok' ? 'var(--dash-status-ok)'
                : liveStatus === 'warn' ? 'var(--dash-status-warn)'
                : '#ef4444'
              }`,
            }}
          />
          <span className="font-semibold text-base sm:text-lg" style={{ color: 'var(--dash-text-primary)' }}>
            {selectedRoute
              ? `${selectedRoute.locomotive_type.toUpperCase()}`
              : (selectedLoco?.name ?? 'KTZ')}
          </span>
          {selectedRoute && (
            <span className="text-xs sm:text-sm font-medium hidden sm:inline" style={{ color: 'var(--dash-text-secondary)' }}>
              · {selectedRoute.name}
            </span>
          )}
        </div>

        {/* Center: route picker */}
        <RouteDropdown
          selected={selectedRoute}
          routes={routes}
          onSelect={(route) => {
            setSelectedRoute(route);
          }}
          onAdd={() => setShowCreateRoute(true)}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <ConnectionBadge status={connStatus} latency={latency} />

          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--dash-gold)',
              borderWidth: '1px',
              color: 'var(--dash-gold)',
              backgroundColor: 'rgba(240, 192, 64, 0.1)',
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <div className="text-xs sm:text-sm font-medium" style={{ color: 'var(--dash-text-muted)' }}>
            {currentTime} <span className="hidden sm:inline">· обновл. 2с</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mb-4">
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasMotorAlert={liveStatus === 'critical'}
        />
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <>
          {showPredictiveAlert && liveStatus !== 'ok' && (
            <PredictiveAlertStrip
              message={`Прогноз · Состояние локомотива: ${liveState ?? 'неизвестно'}`}
              onDismiss={() => setShowPredictiveAlert(false)}
            />
          )}

          {/* Active Alert */}
          {liveStatus === 'critical' && (
            <div
              className="border-l-4 border rounded-lg p-2.5 mb-3"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderColor: '#ef4444',
                borderWidth: '0.5px',
                borderLeftWidth: '3px',
                borderLeftColor: '#ef4444',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderWidth: '0.5px',
                      borderColor: '#ef4444',
                    }}
                  >
                    <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                  </div>
                  <div className="font-bold text-sm" style={{ color: '#ff6b6b' }}>
                    ALERT · {selectedLoco.name} — критическое состояние
                  </div>
                </div>
                <div className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>
                  {currentTime}
                </div>
              </div>
              <div className="text-xs font-medium mb-2" style={{ color: '#fca5a5', paddingLeft: '36px' }}>
                Состояние: {liveState} · Индекс здоровья: {Math.round(liveHealth)}
              </div>
              <div style={{ paddingLeft: '36px' }}>
                <button
                  onClick={() => setAlertExpanded(!alertExpanded)}
                  className="px-3 py-1.5 text-xs border rounded transition-all font-semibold flex items-center gap-1.5"
                  style={{
                    borderColor: 'var(--dash-border)',
                    borderWidth: '0.5px',
                    color: 'var(--dash-text-secondary)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {alertExpanded ? 'Скрыть' : 'Узнать причину'}
                </button>
              </div>
              {alertExpanded && (
                <div
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopWidth: '0.5px', paddingLeft: '36px' }}
                >
                  <div className="text-xs" style={{ color: 'var(--dash-text-secondary)', lineHeight: '1.5' }}>
                    Телеметрия указывает на критическое состояние локомотива{' '}
                    {selectedLoco.name}. Индекс здоровья: {Math.round(liveHealth)}.
                    Скорость: {Math.round(liveSpeed)} км/ч.
                    Рекомендуется немедленная проверка параметров.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Health Index */}
            <div
              className="border rounded-lg p-3 sm:p-4 flex flex-col"
              style={{
                backgroundColor: 'var(--dash-bg-card)',
                borderColor: 'var(--dash-border)',
                borderWidth: '0.5px',
              }}
            >
              <div
                className="text-xs mb-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--dash-text-primary)' }}
              >
                Индекс здоровья
              </div>
              <div className="mb-4">
                <CircularGauge value={Math.round(liveHealth)} label="Индекс здоровья" />
              </div>
              <div
                className="pt-3 border-t flex-1"
                style={{ borderColor: 'var(--dash-border)', borderTopWidth: '0.5px' }}
              >
                <div
                  className="text-xs mb-2 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--dash-text-primary)' }}
                >
                  Параметры телеметрии
                </div>
                <div className="flex flex-col gap-1.5">
                  {telemetry?.parameters && Object.keys(telemetry.parameters).length > 0 ? (
                    Object.entries(telemetry.parameters)
                      .slice(0, 5)
                      .map(([key, val]) => (
                        <FactorRow
                          key={key}
                          name={key}
                          barWidth={Math.min(100, Math.abs(Number(val) || 0))}
                          delta={0}
                          status="ok"
                        />
                      ))
                  ) : (
                    <>
                      <FactorRow name="Скорость" barWidth={Math.round((liveSpeed / 120) * 100)} delta={0} status="ok" />
                      <FactorRow name="Индекс здоровья" barWidth={Math.round(liveHealth)} delta={0} status={liveHealth < 70 ? 'warn' : 'ok'} />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Speed + Route */}
            <div className="space-y-3">
              <div
                className="border rounded-lg p-3 sm:p-4"
                style={{
                  backgroundColor: 'var(--dash-bg-card)',
                  borderColor: 'var(--dash-border)',
                  borderWidth: '0.5px',
                }}
              >
                <div
                  className="text-xs mb-3 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--dash-text-primary)' }}
                >
                  Скорость и тяга
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                  <ArcGauge value={Math.round(liveSpeed)} max={120} unit="км/ч" />

                  <div className="flex flex-col gap-2 sm:ml-4 w-full sm:w-auto">
                    <div
                      className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          liveStatus === 'ok'
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(239,68,68,0.1)',
                        borderColor:
                          liveStatus === 'ok'
                            ? 'var(--dash-status-ok)'
                            : '#ef4444',
                        borderWidth: '0.5px',
                      }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{
                          color:
                            liveStatus === 'ok'
                              ? 'var(--dash-status-ok)'
                              : '#ef4444',
                        }}
                      >
                        {liveState ?? 'Нет данных'}
                      </span>
                    </div>

                    <div className="flex gap-4 justify-center sm:justify-start sm:flex-col sm:gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>
                          Макс.:
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--dash-text-primary)' }}>
                          {selectedLoco.type === 'electric' ? '120' : '120'} км/ч
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>
                          Мощность:
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--dash-text-primary)' }}>
                          {selectedLoco.type === 'electric' ? '8800' : '3356'} кВт
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MetricCell
                    value={telemetry ? String(Math.round(liveHealth)) : '—'}
                    unit="%"
                    label="Здоровье"
                    status={liveHealth >= 80 ? 'ok' : liveHealth >= 60 ? 'warn' : 'crit'}
                  />
                  <MetricCell
                    value={telemetry ? String(Math.round(liveSpeed)) : '—'}
                    unit="км/ч"
                    label="Скорость"
                    status="ok"
                  />
                </div>
              </div>

              {/* Route Map */}
              <div
                className="border rounded-lg p-3 sm:p-4"
                style={{
                  backgroundColor: 'var(--dash-bg-card)',
                  borderColor: 'var(--dash-border)',
                  borderWidth: '0.5px',
                }}
              >
                <div
                  className="text-xs mb-3 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--dash-text-primary)' }}
                >
                  Маршрут
                </div>
                {selectedRoute ? (
                  <RouteMap
                    stationList={stationList}
                    currentKm={Math.round(liveSpeed * 2)}
                    totalKm={500}
                  />
                ) : (
                  <div
                    className="text-xs text-center py-4"
                    style={{ color: 'var(--dash-text-muted)' }}
                  >
                    Маршрут не назначен
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playback stub */}
          <div
            className="border rounded-lg p-3 sm:p-4 mt-3"
            style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              borderWidth: '0.5px',
            }}
          >
            <div className="relative mb-3 sm:mb-4">
              <div
                className="relative h-1.5 rounded-full cursor-pointer"
                style={{ backgroundColor: 'rgba(156, 163, 175, 0.3)' }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ backgroundColor: 'var(--dash-accent)', width: '32%' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div
                className="text-xs sm:text-sm font-medium"
                style={{ color: 'var(--dash-text-secondary)', fontFamily: 'monospace' }}
              >
                LIVE
              </div>
              <div
                className="text-xs sm:text-sm font-medium"
                style={{ color: 'var(--dash-text-secondary)', fontFamily: 'monospace' }}
              >
                {currentTime}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab Content: Motors */}
      {activeTab === 'motors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <MotorDetailCard
              key={i}
              label={`ТЭД ${i + 1}`}
              temp={85 + Math.round(Math.random() * 20)}
              current={470 + Math.round(Math.random() * 60)}
              status={liveStatus === 'critical' && i === 2 ? 'warn' : 'ok'}
            />
          ))}
        </div>
      )}

      {/* Tab Content: Electrics */}
      {activeTab === 'electrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div
            className="border rounded-[10px] p-5"
            style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              boxShadow: 'var(--dash-shadow)',
            }}
          >
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>
              Контактная сеть
            </div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Напряжение КС" value="25.1" unit="кВ" status="ok" />
              <ParamRow name="Ток ТЭД (средний)" value={telemetry ? String(Math.round(liveSpeed * 6.5)) : '—'} unit="А" status="ok" />
              <ParamRow name="Мощность потребления" value={telemetry ? String(Math.round(liveSpeed * 57)) : '—'} unit="кВт" status="ok" />
              <ParamRow name="Рекуперация" value="Активна" unit="" status="ok" />
            </div>
          </div>

          <div
            className="border rounded-[10px] p-5"
            style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              boxShadow: 'var(--dash-shadow)',
            }}
          >
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>
              Тепловые узлы
            </div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Состояние" value={liveState ?? '—'} unit="" status={liveStatus === 'critical' ? 'warn' : 'ok'} />
              <ParamRow name="Индекс здоровья" value={telemetry ? String(Math.round(liveHealth)) : '—'} unit="%" status={liveHealth < 70 ? 'warn' : 'ok'} />
              <ParamRow name="Скорость" value={telemetry ? String(Math.round(liveSpeed)) : '—'} unit="км/ч" status="ok" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Brakes */}
      {activeTab === 'brakes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div
            className="border rounded-[10px] p-5"
            style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              boxShadow: 'var(--dash-shadow)',
            }}
          >
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>
              Тормозная система
            </div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Давление тормоз. магистрали" value="6.2" unit="бар" status="ok" />
              <ParamRow name="Давление питательной" value="8.1" unit="бар" status="ok" />
              <ParamRow name="Рекуперативное торможение" value="Активно" unit="" status="ok" />
            </div>
          </div>

          <div
            className="border rounded-[10px] p-5"
            style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              boxShadow: 'var(--dash-shadow)',
            }}
          >
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>
              Прочие параметры
            </div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Масса состава" value="6200" unit="т" status="ok" />
              <ParamRow name="Сила тяги макс." value="833" unit="кН" status="ok" />
              <ParamRow name="Тип" value={selectedLoco.type} unit="" status="ok" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--dash-text-primary)' }}
            >
              История событий (последние 30 мин)
            </h2>
            <button
              onClick={exportHistoryCSV}
              className="px-3 py-1.5 text-xs border rounded transition-colors font-semibold flex items-center gap-1.5"
              style={{
                borderColor: 'var(--dash-border)',
                borderWidth: '0.5px',
                color: 'var(--dash-text-secondary)',
                backgroundColor: 'transparent',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Экспорт CSV
            </button>
          </div>

          {historyEvents.length > 0 ? (
            historyEvents.map((ev, i) => (
              <EventCard
                key={i}
                timestamp={new Date(ev.timestamp).toLocaleTimeString('ru-RU')}
                title={`Скорость: ${ev.speed.toFixed(1)} км/ч`}
                description={`Здоровье: ${ev.health_index.toFixed(1)} · Состояние: ${ev.state}`}
                badge={ev.health_index < 60 ? 'active' : ev.health_index < 80 ? 'warning' : 'ok'}
              />
            ))
          ) : (
            <div
              className="text-xs text-center py-8"
              style={{ color: 'var(--dash-text-muted)' }}
            >
              {telemetry === null ? 'Загрузка истории…' : 'Нет данных за последние 30 минут'}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: AI */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>
              Автоматические объяснения
            </div>
            <AIPanel
              title={`Анализ: ${selectedLoco.name}`}
              bodyText={
                telemetry
                  ? `Последнее обновление: ${new Date(telemetry.timestamp).toLocaleTimeString('ru-RU')}. ` +
                    `Скорость: ${telemetry.speed.toFixed(1)} км/ч. ` +
                    `Индекс здоровья: ${telemetry.health_index.toFixed(1)}. ` +
                    `Состояние: ${telemetry.state}. ` +
                    (liveStatus === 'critical'
                      ? 'Обнаружено критическое состояние. Рекомендуется немедленная проверка.'
                      : liveStatus === 'warn'
                        ? 'Выявлены отклонения. Рекомендуется плановое техобслуживание.'
                        : 'Все параметры в норме. Эксплуатация разрешена.')
                  : 'Ожидание данных с бэкенда…'
              }
              updatedAt={telemetry ? new Date(telemetry.timestamp).toLocaleTimeString('ru-RU') : '—'}
              indexChange={`${Math.round(liveHealth)}`}
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>
            Данные обновляются каждые 2 секунды через polling или WebSocket.
          </div>
        </div>
      )}

      {/* Floating AI Button */}
      <button
        onClick={() => setChatDrawerOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: 'var(--dash-gold)',
          boxShadow: '0 4px 12px rgba(240, 192, 64, 0.3)',
        }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <ChatDrawer isOpen={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} />

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={showCreateRoute}
        onClose={() => setShowCreateRoute(false)}
        onCreated={(route) => {
          setRoutes((prev) => [...prev, route]);
          setSelectedRoute(route);
          onRouteCreated(route);
          setShowCreateRoute(false);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root — loads data before rendering Dashboard
// ---------------------------------------------------------------------------

function AppContent() {
  const [locos, setLocos] = useState<LocoViewModel[] | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [locomotiveData, routeData] = await Promise.all([
          getLocomotives(),
          getRoutes().catch(() => [] as RouteInfo[]),
        ]);

        if (cancelled) return;

        const viewModels: LocoViewModel[] = locomotiveData.map((info: LocomotiveInfo) => {
          const matchedRoute = routeData.find(
            (r: RouteInfo) =>
              r.locomotive_type === info.id ||
              r.locomotive_type === info.type.toLowerCase(),
          );
          return {
            id: info.id,
            name: displayName(info),
            type: info.type,
            status: toStatus(info.current_state),
            healthIndex: 80,
            speed: 0,
            hasAlert: info.current_state === 'fault',
            route: matchedRoute,
          };
        });

        setLocos(viewModels);
        setRoutes(routeData);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            `Не удалось подключиться к бэкенду. Убедитесь, что FastAPI запущен на http://localhost:8000.\n\n${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [attempt]);

  if (error) {
    return <ErrorScreen message={error} onRetry={() => setAttempt((n) => n + 1)} />;
  }

  if (!locos) {
    return <Spinner />;
  }

  return (
    <Dashboard
      locos={locos}
      routes={routes}
      onRouteCreated={(route) => {
        setRoutes((prev) => [...prev, route]);
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}