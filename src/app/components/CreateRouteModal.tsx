import { useState, useEffect, useRef } from 'react';
import { createRoute } from '@/api';
import type { RouteInfo, RouteCreate } from '@/api';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (route: RouteInfo) => void;
}

const LOCOMOTIVE_TYPES = [
  { value: 'kz8a', label: 'KZ8A (электровоз, 8800 кВт)' },
  { value: 'te33a', label: 'ТЭ33А (тепловоз, 3356 кВт)' },
];

interface FieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function Field({ label, id, value, onChange, placeholder, error, required }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--dash-text-muted)',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${error ? '#ef4444' : 'var(--dash-border)'}`,
          backgroundColor: 'var(--dash-bg-page)',
          color: 'var(--dash-text-primary)',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.15s',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => {
          if (!error) e.target.style.borderColor = 'var(--dash-gold)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : 'var(--dash-border)';
        }}
      />
      {error && (
        <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>
      )}
    </div>
  );
}

export function CreateRouteModal({ isOpen, onClose, onCreated }: CreateRouteModalProps) {
  const [name, setName] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [locoType, setLocoType] = useState('kz8a');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setFromCity('');
      setToCity('');
      setLocoType('kz8a');
      setErrors({});
      setApiError(null);
      setLoading(false);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Введите название маршрута';
    if (!fromCity.trim()) errs.fromCity = 'Введите город отправления';
    if (!toCity.trim()) errs.toCity = 'Введите город назначения';
    if (fromCity.trim() && toCity.trim() && fromCity.trim() === toCity.trim()) {
      errs.toCity = 'Город назначения должен отличаться от отправления';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const payload: RouteCreate = {
      name: name.trim(),
      from_city: fromCity.trim(),
      to_city: toCity.trim(),
      locomotive_type: locoType,
    };

    try {
      const created = await createRoute(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Неизвестная ошибка сервера',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {/* Modal panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 16,
            border: '1px solid var(--dash-border)',
            backgroundColor: 'var(--dash-bg-card)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--dash-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'rgba(240,192,64,0.15)',
                  border: '1px solid rgba(240,192,64,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="var(--dash-gold)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2
                  id="modal-title"
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--dash-text-primary)',
                  }}
                >
                  Создать маршрут
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--dash-text-muted)' }}>
                  POST /api/routes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--dash-border)',
                backgroundColor: 'transparent',
                color: 'var(--dash-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--dash-bg-page)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--dash-text-muted)';
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { void handleSubmit(e); }} style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name */}
              <div>
                <label
                  htmlFor="route-name"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--dash-text-muted)',
                  }}
                >
                  Название маршрута <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="route-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Астана – Қарағанды Грузовой"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${errors.name ? '#ef4444' : 'var(--dash-border)'}`,
                    backgroundColor: 'var(--dash-bg-page)',
                    color: 'var(--dash-text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.name && (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>{errors.name}</p>
                )}
              </div>

              {/* From / To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field
                  label="Откуда"
                  id="route-from"
                  value={fromCity}
                  onChange={setFromCity}
                  placeholder="Астана"
                  error={errors.fromCity}
                  required
                />
                <Field
                  label="Куда"
                  id="route-to"
                  value={toCity}
                  onChange={setToCity}
                  placeholder="Қарағанды"
                  error={errors.toCity}
                  required
                />
              </div>

              {/* Locomotive type */}
              <div>
                <label
                  htmlFor="route-loco-type"
                  style={{
                    display: 'block',
                    marginBottom: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--dash-text-muted)',
                  }}
                >
                  Тип локомотива <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LOCOMOTIVE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setLocoType(t.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1px solid ${locoType === t.value ? 'var(--dash-gold)' : 'var(--dash-border)'}`,
                        backgroundColor:
                          locoType === t.value
                            ? 'rgba(240,192,64,0.12)'
                            : 'var(--dash-bg-page)',
                        color:
                          locoType === t.value
                            ? 'var(--dash-gold)'
                            : 'var(--dash-text-secondary)',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: locoType === t.value ? 700 : 500,
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                        {t.value.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>
                        {t.value === 'kz8a' ? 'Электровоз' : 'Тепловоз'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    fontSize: 12,
                    color: '#fca5a5',
                  }}
                >
                  {apiError}
                </div>
              )}

              {/* Preview */}
              {(fromCity || toCity) && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(240,192,64,0.06)',
                    border: '1px solid rgba(240,192,64,0.2)',
                    fontSize: 12,
                    color: 'var(--dash-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <svg width="12" height="12" fill="none" stroke="var(--dash-gold)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span>
                    {fromCity || '…'} → {toCity || '…'}
                    {name && (
                      <span style={{ color: 'var(--dash-text-muted)', marginLeft: 8 }}>
                        · {name}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 24,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--dash-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--dash-text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '9px 24px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: loading ? 'rgba(240,192,64,0.5)' : 'var(--dash-gold)',
                  color: '#000',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTopColor: '#000',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Создание…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Создать маршрут
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
