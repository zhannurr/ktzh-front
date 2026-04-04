// Dashboard App
import { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { MetricCell } from './components/MetricCell';
import { MotorCell } from './components/MotorCell';
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
import { LocomotiveDropdown } from './components/LocomotiveDropdown';
import logoImage from 'figma:asset/60b970c149dc78cc8626355c9fc3c117cae2eca9.png';

interface Locomotive {
  id: string;
  name: string;
  route: string;
  type: 'KZ8A' | 'ТЭ33А';
  status: 'ok' | 'warn' | 'critical';
  healthIndex: number;
  speed: number;
  hasAlert: boolean;
}

function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [currentTime] = useState('14:32:08');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [showPredictiveAlert, setShowPredictiveAlert] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertExpanded, setAlertExpanded] = useState(false);

  // Locomotives list
  const locomotives: Locomotive[] = [
    {
      id: 'kz8a-0044',
      name: 'KZ8A-0044',
      route: 'Астана → Қарағанды',
      type: 'KZ8A',
      status: 'ok',
      healthIndex: 80,
      speed: 74,
      hasAlert: true
    },
    {
      id: 'kz8a-0031',
      name: 'KZ8A-0031',
      route: 'Қарағанды → Балқаш',
      type: 'KZ8A',
      status: 'warn',
      healthIndex: 72,
      speed: 65,
      hasAlert: false
    },
    {
      id: 'te33a-0012',
      name: 'ТЭ33А-0012',
      route: 'Алматы → Шымкент',
      type: 'ТЭ33А',
      status: 'critical',
      healthIndex: 58,
      speed: 48,
      hasAlert: true
    },
    {
      id: 'te33a-0008',
      name: 'ТЭ33А-0008',
      route: 'Астана → Петропавл',
      type: 'ТЭ33А',
      status: 'ok',
      healthIndex: 92,
      speed: 82,
      hasAlert: false
    }
  ];

  const [selectedLocomotive, setSelectedLocomotive] = useState<Locomotive>(locomotives[0]);

  // Get alert data for selected locomotive
  const getAlertData = (locoId: string) => {
    const alerts: Record<string, { title: string; subtitle: string; aiTitle: string; aiText: string; indexChange: string }> = {
      'kz8a-0044': {
        title: 'ALERT · ТЭД №3 перегрев',
        subtitle: '108°C > порог 100°C · Активен 4 мин',
        aiTitle: 'Повышенная температура ТЭД №3',
        aiText: 'Температура третьего тягового двигателя достигла 108°C и продолжает расти. Вероятная причина — затяжной подъём на текущем участке маршрута при высокой нагрузке тяги. Рекомендую снизить тягу на 10–15% и дать режим выбега на 2–3 минуты для охлаждения.',
        indexChange: '80→74'
      },
      'te33a-0012': {
        title: 'ALERT · Перегрев дизеля',
        subtitle: '96°C > порог 90°C · Активен 12 мин',
        aiTitle: 'Критическая температура дизеля',
        aiText: 'Дизель-генератор перегрет из-за длительной работы на максимальной мощности. Система охлаждения не справляется. Рекомендуется снизить нагрузку на 20% и проверить уровень охлаждающей жидкости при следующей остановке.',
        indexChange: '58→51'
      }
    };
    return alerts[locoId] || alerts['kz8a-0044'];
  };

  const currentAlert = getAlertData(selectedLocomotive.id);

  // Get route data for selected locomotive
  const getRouteData = (locoId: string) => {
    const routes: Record<string, { stations: string[]; currentKm: number; totalKm: number }> = {
      'kz8a-0044': { stations: ['Астана', 'Қарағанды'], currentKm: 187, totalKm: 460 },
      'kz8a-0031': { stations: ['Қарағанды', 'Балқаш'], currentKm: 142, totalKm: 380 },
      'te33a-0012': { stations: ['Алматы', 'Шымкент'], currentKm: 320, totalKm: 520 },
      'te33a-0008': { stations: ['Астана', 'Петропавл'], currentKm: 215, totalKm: 435 }
    };
    return routes[locoId] || routes['kz8a-0044'];
  };

  const currentRoute = getRouteData(selectedLocomotive.id);

  // Get predictive message for selected locomotive
  const getPredictiveMessage = (locoId: string) => {
    const messages: Record<string, string | null> = {
      'kz8a-0044': 'Прогноз · Темп. трансформатора растёт +1.8°C/мин → критично через ~11 мин',
      'kz8a-0031': 'Прогноз · Напряжение КС падает −0.3 кВ/мин → критично через ~18 мин',
      'te33a-0012': 'Прогноз · Давление масла падает −0.2 бар/мин → критично через ~8 мин',
      'te33a-0008': null // No predictive alert for this locomotive
    };
    return messages[locoId];
  };

  const predictiveMessage = getPredictiveMessage(selectedLocomotive.id);

  // Export history events as CSV
  const exportHistoryCSV = () => {
    const events = [
      { timestamp: '14:32:04', title: 'Алерт: ТЭД №3 перегрев', description: '108°C › порог 100°C', badge: 'active' },
      { timestamp: '14:28:41', title: 'Индекс здоровья: 91 → 80', description: 'Рост темп. ТЭД №3', badge: 'warning' },
      { timestamp: '14:22:10', title: 'Рекуперация активирована', description: 'Торможение на спуске', badge: 'ok' },
      { timestamp: '14:17:55', title: 'Скорость: 52 → 74 км/ч', description: 'Разгон на перегоне', badge: 'ok' },
    ];

    const csvContent = [
      ['Время', 'Событие', 'Описание', 'Статус'],
      ...events.map(e => [e.timestamp, e.title, e.description, e.badge])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `KZ8A-0044_history_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen overflow-y-auto p-2 sm:p-4" style={{
      backgroundColor: 'var(--dash-bg-page)',
      color: 'var(--dash-text-primary)',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b" style={{
        borderColor: 'var(--dash-border)',
        borderBottomWidth: '0.5px'
      }}>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <img src={logoImage} alt="Logo" className="h-8 sm:h-10 w-auto" />
          <div className="w-2 h-2 rounded-full" style={{
            backgroundColor: selectedLocomotive.status === 'ok' ? 'var(--dash-status-ok)' : selectedLocomotive.status === 'warn' ? 'var(--dash-status-warn)' : '#ef4444',
            boxShadow: `0 0 6px ${selectedLocomotive.status === 'ok' ? 'var(--dash-status-ok)' : selectedLocomotive.status === 'warn' ? 'var(--dash-status-warn)' : '#ef4444'}`
          }} />
          <span className="font-semibold text-base sm:text-lg" style={{ color: 'var(--dash-text-primary)' }}>{selectedLocomotive.name}</span>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline" style={{ color: 'var(--dash-text-secondary)' }}>· {selectedLocomotive.route}</span>
        </div>

        <LocomotiveDropdown
          selected={selectedLocomotive}
          locomotives={locomotives}
          onSelect={setSelectedLocomotive}
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'var(--dash-status-ok)',
            borderWidth: '0.5px'
          }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{
              backgroundColor: 'var(--dash-status-ok)',
              boxShadow: '0 0 6px var(--dash-status-ok)'
            }} />
            <span className="text-xs font-bold" style={{ color: 'var(--dash-status-ok)' }}>LIVE</span>
            <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--dash-text-muted)' }}>24ms</span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--dash-gold)',
              borderWidth: '1px',
              color: 'var(--dash-gold)',
              backgroundColor: 'rgba(240, 192, 64, 0.1)'
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
            {currentTime} <span className="hidden sm:inline">· обновл. 1с</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mb-4">
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasMotorAlert={selectedLocomotive.hasAlert}
        />
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Predictive Alert Strip - thin informational banner */}
          {showPredictiveAlert && predictiveMessage && (
            <PredictiveAlertStrip
              message={predictiveMessage}
              onDismiss={() => setShowPredictiveAlert(false)}
            />
          )}

          {/* Active Alert with expandable AI explanation */}
          {selectedLocomotive.hasAlert && (
          <div className="border-l-4 border rounded-lg p-2.5 mb-3" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderColor: '#ef4444',
            borderWidth: '0.5px',
            borderLeftWidth: '3px',
            borderLeftColor: '#ef4444'
          }}>
            {/* Top row: icon, title, time, close */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderWidth: '0.5px',
                  borderColor: '#ef4444'
                }}>
                  <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="font-bold text-sm" style={{ color: '#ff6b6b' }}>
                  {currentAlert.title}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>14:32:04</div>
                <button className="w-4 h-4 flex items-center justify-center transition-colors" style={{ color: 'var(--dash-text-muted)' }}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Second row: gray subtitle */}
            <div className="text-xs font-medium mb-2" style={{ color: '#fca5a5', paddingLeft: '36px' }}>
              {currentAlert.subtitle}
            </div>

            {/* Third row: AI button */}
            <div style={{ paddingLeft: '36px' }}>
              <button
                onClick={() => setAlertExpanded(!alertExpanded)}
                className="px-3 py-1.5 text-xs border rounded transition-all font-semibold flex items-center gap-1.5"
                style={{
                  borderColor: 'var(--dash-border)',
                  borderWidth: '0.5px',
                  color: 'var(--dash-text-secondary)',
                  backgroundColor: 'transparent'
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {alertExpanded ? 'Скрыть объяснение' : 'Узнать причину'}
              </button>
            </div>

            {/* Expandable AI explanation */}
            {alertExpanded && (
              <div className="mt-3 pt-3 border-t" style={{
                borderColor: 'rgba(239, 68, 68, 0.2)',
                borderTopWidth: '0.5px',
                paddingLeft: '36px'
              }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0" style={{
                      backgroundColor: 'var(--dash-gold)',
                      color: 'white'
                    }}>
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dash-text-primary)' }}>
                        {currentAlert.aiTitle}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--dash-text-secondary)', lineHeight: '1.5' }}>
                        {currentAlert.aiText}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="text-[10px] font-medium px-2 py-0.5 rounded" style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444'
                    }}>
                      {currentAlert.indexChange}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--dash-text-muted)' }}>14:32:06</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Key Metrics - responsive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Left Column: Health Index (full height) */}
            <div className="border rounded-lg p-3 sm:p-4 flex flex-col" style={{
              backgroundColor: 'var(--dash-bg-card)',
              borderColor: 'var(--dash-border)',
              borderWidth: '0.5px'
            }}>
              <div className="text-xs mb-3 font-semibold uppercase tracking-wider" style={{ color: 'var(--dash-text-primary)' }}>Индекс здоровья</div>
              <div className="mb-4">
                <CircularGauge value={selectedLocomotive.healthIndex} label="Индекс здоровья" />
              </div>
              <div className="pt-3 border-t flex-1" style={{
                borderColor: 'var(--dash-border)',
                borderTopWidth: '0.5px'
              }}>
                <div className="text-xs mb-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--dash-text-primary)' }}>Топ факторы влияния</div>
                <div className="flex flex-col gap-1.5">
                  <FactorRow name="Температура ТЭД" barWidth={67} delta={-8} status="ok" />
                  <FactorRow name="Напряжение КС" barWidth={50} delta={-5} status="ok" />
                  <FactorRow name="Ток ТЭД" barWidth={33} delta={-4} status="warn" />
                  <FactorRow name="Давление тормозов" barWidth={17} delta={-3} status="ok" />
                  <FactorRow name="Темп. трансформатора" barWidth={0} delta={-2} status="ok" />
                </div>
              </div>
            </div>

            {/* Right Column: Speed and Route */}
            <div className="space-y-3">
              {/* Speed and Traction */}
              <div className="border rounded-lg p-3 sm:p-4" style={{
                backgroundColor: 'var(--dash-bg-card)',
                borderColor: 'var(--dash-border)',
                borderWidth: '0.5px'
              }}>
                <div className="text-xs mb-3 font-semibold uppercase tracking-wider" style={{ color: 'var(--dash-text-primary)' }}>Скорость и тяга</div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                  <ArcGauge value={selectedLocomotive.speed} max={120} unit="км/ч" />

                  <div className="flex flex-col gap-2 sm:ml-4 w-full sm:w-auto">
                    <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 rounded-full" style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderColor: 'var(--dash-status-ok)',
                      borderWidth: '0.5px'
                    }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--dash-status-ok)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-xs font-bold" style={{ color: 'var(--dash-status-ok)' }}>Разгон</span>
                    </div>

                    <div className="flex gap-4 justify-center sm:justify-start sm:flex-col sm:gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>Средняя:</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--dash-text-primary)' }}>68 км/ч</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>Макс.:</span>
                        <span className="text-sm font-bold" style={{ color: 'var(--dash-text-primary)' }}>82 км/ч</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MetricCell value="612" unit="кН" label="Сила тяги" status="ok" />
                  <MetricCell value="4200" unit="кВт" label="Рекуперация" status="ok" />
                </div>
              </div>

              {/* Route */}
              <div className="border rounded-lg p-3 sm:p-4" style={{
                backgroundColor: 'var(--dash-bg-card)',
                borderColor: 'var(--dash-border)',
                borderWidth: '0.5px'
              }}>
                <div className="text-xs mb-3 font-semibold uppercase tracking-wider" style={{ color: 'var(--dash-text-primary)' }}>Маршрут</div>
                <RouteMap
                  stationList={currentRoute.stations}
                  currentKm={currentRoute.currentKm}
                  totalKm={currentRoute.totalKm}
                />
              </div>
            </div>
          </div>

          {/* Historical Replay Controls */}
          <div className="border rounded-lg p-3 sm:p-4 mt-3" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            borderWidth: '0.5px'
          }}>
            {/* Timeline Slider */}
            <div className="relative mb-3 sm:mb-4">
              <div className="relative h-1.5 rounded-full cursor-pointer" style={{ backgroundColor: 'rgba(156, 163, 175, 0.3)' }}>
                {/* Played portion */}
                <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{
                  backgroundColor: 'var(--dash-accent)',
                  width: '32%'
                }} />

                {/* Playhead handle */}
                <div className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing" style={{
                  left: '32%',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <div className="w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ml-[0px] mr-[-9px] mt-[0px] mb-[-7px]" style={{
                    backgroundColor: 'var(--dash-accent)',
                    borderColor: 'white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Current time - left */}
              <div className="text-xs sm:text-sm font-medium" style={{
                color: 'var(--dash-text-secondary)',
                fontFamily: 'monospace',
                minWidth: '40px sm:60px'
              }}>
                0:32
              </div>

              {/* Playback controls - center */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Skip backward */}
                <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded transition-colors hover:bg-opacity-10" style={{
                  color: 'var(--dash-text-secondary)'
                }}>
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                    <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">10</text>
                  </svg>
                </button>

                {/* Play button (large, primary) */}
                <button className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full transition-all hover:scale-105 shadow-lg" style={{
                  backgroundColor: 'var(--dash-accent)',
                  color: 'white'
                }}>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                {/* Skip forward */}
                <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded transition-colors hover:bg-opacity-10" style={{
                  color: 'var(--dash-text-secondary)'
                }}>
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                    <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">10</text>
                  </svg>
                </button>
              </div>

              {/* Total time - right */}
              <div className="text-xs sm:text-sm font-medium text-right" style={{
                color: 'var(--dash-text-secondary)',
                fontFamily: 'monospace',
                minWidth: '40px sm:60px'
              }}>
                4:05
              </div>
            </div>

            {/* Time Range Selector */}
            
          </div>
        </>
      )}

      {/* Tab Content: Motors */}
      {activeTab === 'motors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MotorDetailCard label="ТЭД 1" temp={92} current={480} status="ok" />
          <MotorDetailCard label="ТЭД 2" temp={89} current={475} status="ok" />
          <MotorDetailCard label="ТЭД 3" temp={108} current={530} status="warn" />
          <MotorDetailCard label="ТЭД 4" temp={91} current={485} status="ok" />
          <MotorDetailCard label="ТЭД 5" temp={88} current={470} status="ok" />
          <MotorDetailCard label="ТЭД 6" temp={93} current={490} status="ok" />
          <MotorDetailCard label="ТЭД 7" temp={90} current={480} status="ok" />
          <MotorDetailCard label="ТЭД 8" temp={87} current={465} status="ok" />
        </div>
      )}

      {/* Tab Content: Electrics */}
      {activeTab === 'electrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="border rounded-[10px] p-5" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            boxShadow: 'var(--dash-shadow)'
          }}>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>Контактная сеть</div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Напряжение КС" value="25.1" unit="кВ" status="ok" />
              <ParamRow name="Ток ТЭД (средний)" value="487" unit="А" status="warn" />
              <ParamRow name="Мощность потребления" value="4280" unit="кВт" status="ok" />
              <ParamRow name="Рекуперация" value="4200" unit="кВт" status="ok" />
            </div>
          </div>

          <div className="border rounded-[10px] p-5" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            boxShadow: 'var(--dash-shadow)'
          }}>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>Тепловые узлы</div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Темп. трансформатора" value="74" unit="°C" status="ok" />
              <ParamRow name="Темп. инверторов" value="68" unit="°C" status="ok" />
              <ParamRow name="Темп. выпрямителей" value="71" unit="°C" status="ok" />
              <ParamRow name="Автоведение" value="Вкл." status="ok" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Brakes */}
      {activeTab === 'brakes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="border rounded-[10px] p-5" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            boxShadow: 'var(--dash-shadow)'
          }}>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>Тормозная система</div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Давление тормоз. магистрали" value="6.2" unit="бар" status="ok" />
              <ParamRow name="Давление питательной" value="8.1" unit="бар" status="ok" />
              <ParamRow name="Рекуперативное торможение" value="Активно" status="ok" />
            </div>
          </div>

          <div className="border rounded-[10px] p-5" style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            boxShadow: 'var(--dash-shadow)'
          }}>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>Прочие параметры</div>
            <div className="flex flex-col gap-2">
              <ParamRow name="Темп. внешнего воздуха" value="+22" unit="°C" status="ok" />
              <ParamRow name="Масса состава" value="6200" unit="т" status="ok" />
              <ParamRow name="Сила тяги макс." value="833" unit="кН" status="ok" />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === 'history' && (
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--dash-text-primary)' }}>
              История событий
            </h2>
            <button
              onClick={exportHistoryCSV}
              className="px-3 py-1.5 text-xs border rounded transition-colors font-semibold flex items-center gap-1.5"
              style={{
                borderColor: 'var(--dash-border)',
                borderWidth: '0.5px',
                color: 'var(--dash-text-secondary)',
                backgroundColor: 'transparent'
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Экспорт CSV
            </button>
          </div>
          <EventCard
            timestamp="14:32:04"
            title="Алерт: ТЭД №3 перегрев"
            description="108°C › порог 100°C"
            badge="active"
          />
          <EventCard
            timestamp="14:28:41"
            title="Индекс здоровья: 91 → 80"
            description="Рост темп. ТЭД №3"
            badge="warning"
          />
          <EventCard
            timestamp="14:22:10"
            title="Рекуперация активирована"
            description="Торможение на спуске"
            badge="ok"
          />
          <EventCard
            timestamp="14:17:55"
            title="Скорость: 52 → 74 км/ч"
            description="Разгон на перегоне"
            badge="ok"
          />
        </div>
      )}

      {/* Tab Content: AI Assistant */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div>
            <div className="text-xs mb-3" style={{ color: 'var(--dash-text-primary)' }}>Автоматические объяснения</div>
            <AIPanel
              title="Повышенная температура ТЭД №3"
              bodyText="Температура третьего тягового двигателя достигла 108°C и продолжает расти. Вероятная причина — затяжной подъём на текущем участке маршрута при высокой нагрузке тяги. Рекомендую снизить тягу на 10–15% и дать режим выбега на 2–3 минуты для охлаждения."
              updatedAt="14:32:06"
              indexChange="80→74"
            />
          </div>

          <div className="text-xs" style={{ color: 'var(--dash-text-muted)' }}>
            Предиктив: темп. трансформатора → критично через ~11 мин при тренде +1.8°C/мин
          </div>
        </div>
      )}

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setChatDrawerOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: 'var(--dash-gold)',
          boxShadow: '0 4px 12px rgba(240, 192, 64, 0.3)'
        }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {/* Chat Drawer */}
      <ChatDrawer isOpen={chatDrawerOpen} onClose={() => setChatDrawerOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}