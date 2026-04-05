import { useState, useRef, useEffect } from 'react';
import type { RouteInfo } from '@/api';

interface RouteDropdownProps {
  selected: RouteInfo | null;
  routes: RouteInfo[];
  onSelect: (route: RouteInfo) => void;
  onAdd: () => void;
}

const LOCO_BADGE: Record<string, { label: string; color: string }> = {
  kz8a:  { label: 'KZ8A',  color: '#4ade80' },
  te33a: { label: 'ТЭ33А', color: '#facc15' },
};

export function RouteDropdown({ selected, routes, onSelect, onAdd }: RouteDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const badge = selected ? (LOCO_BADGE[selected.locomotive_type] ?? { label: selected.locomotive_type.toUpperCase(), color: 'var(--dash-text-muted)' }) : null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Dropdown trigger */}
      <button
        id="route-dropdown-trigger"
        onClick={() => setIsOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          border: '0.5px solid var(--dash-border)',
          backgroundColor: 'var(--dash-bg-card)',
          color: 'var(--dash-text-primary)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'inherit',
          minWidth: 180,
          maxWidth: 280,
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--dash-gold)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--dash-border)')}
      >
        {/* Left: route icon */}
        <svg width="14" height="14" fill="none" stroke="var(--dash-text-muted)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>

        {/* Center: route name */}
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected
            ? `${selected.from_city} → ${selected.to_city}`
            : routes.length === 0
              ? 'Нет маршрутов'
              : 'Выбрать маршрут'}
        </span>

        {/* Loco badge */}
        {badge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: 4,
              backgroundColor: `${badge.color}22`,
              color: badge.color,
              border: `1px solid ${badge.color}44`,
              flexShrink: 0,
            }}
          >
            {badge.label}
          </span>
        )}

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="var(--dash-text-muted)"
          viewBox="0 0 24 24"
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Add button */}
      <button
        id="btn-create-route"
        onClick={onAdd}
        title="Создать маршрут"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          border: '1px solid var(--dash-border)',
          backgroundColor: 'var(--dash-bg-card)',
          color: 'var(--dash-gold)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--dash-gold)';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(240,192,64,0.1)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--dash-border)';
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--dash-bg-card)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 200,
            minWidth: 320,
            maxWidth: 380,
            borderRadius: 12,
            border: '1px solid var(--dash-border)',
            backgroundColor: 'var(--dash-bg-card)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            animation: 'routeDropIn 0.15s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px 8px',
              borderBottom: '0.5px solid var(--dash-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--dash-text-muted)' }}>
              Маршруты · {routes.length}
            </span>
          </div>

          {/* Route list */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {routes.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: 13 }}>
                <div style={{ marginBottom: 8, fontSize: 24 }}>🛤️</div>
                Маршруты не найдены.<br />
                Нажмите <strong style={{ color: 'var(--dash-gold)' }}>+</strong> чтобы создать.
              </div>
            ) : (
              routes.map((route) => {
                const b = LOCO_BADGE[route.locomotive_type] ?? { label: route.locomotive_type.toUpperCase(), color: 'var(--dash-text-muted)' };
                const isSelected = selected?.id === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      onSelect(route);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: '0.5px solid var(--dash-border)',
                      backgroundColor: isSelected ? 'rgba(240,192,64,0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.1s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = isSelected ? 'rgba(240,192,64,0.08)' : 'transparent';
                    }}
                  >
                    {/* Route icon */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: isSelected ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isSelected ? 'rgba(240,192,64,0.3)' : 'var(--dash-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke={isSelected ? 'var(--dash-gold)' : 'var(--dash-text-muted)'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Route info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: isSelected ? 'var(--dash-gold)' : 'var(--dash-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {route.from_city} → {route.to_city}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--dash-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 1,
                      }}>
                        {route.name}
                      </div>
                    </div>

                    {/* Loco type badge */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: `${b.color}22`,
                      color: b.color,
                      border: `1px solid ${b.color}44`,
                      flexShrink: 0,
                    }}>
                      {b.label}
                    </span>

                    {/* Checkmark */}
                    {isSelected && (
                      <svg width="14" height="14" fill="none" stroke="var(--dash-gold)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes routeDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
