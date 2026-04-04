interface MotorDetailCardProps {
  label: string;
  temp: number;
  current: number;
  status: 'ok' | 'warn' | 'crit';
}

export function MotorDetailCard({ label, temp, current, status }: MotorDetailCardProps) {
  const getStatusColor = () => {
    if (status === 'ok') return 'var(--dash-status-ok)';
    if (status === 'warn') return 'var(--dash-status-warn)';
    return 'var(--dash-status-crit)';
  };

  const getStatusText = () => {
    if (status === 'ok') return 'Норма';
    if (status === 'warn') return 'Внимание';
    return 'Критично';
  };

  const isWarning = status === 'warn';

  return (
    <div
      className="border rounded-lg p-3"
      style={{
        backgroundColor: 'var(--dash-bg-card)',
        borderColor: isWarning ? 'var(--dash-status-warn)' : 'var(--dash-border)',
        borderWidth: isWarning ? '1px' : '0.5px'
      }}
    >
      <div
        className="text-xs font-medium mb-2 uppercase tracking-wider"
        style={{ color: isWarning ? 'var(--dash-status-warn)' : 'var(--dash-text-muted)' }}
      >
        {isWarning ? `${label} — Внимание` : label}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--dash-text-secondary)' }}>Температура</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium" style={{ color: isWarning ? getStatusColor() : 'var(--dash-gold)' }}>{temp}°C</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor() }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--dash-text-secondary)' }}>Ток</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium" style={{ color: isWarning ? getStatusColor() : 'var(--dash-gold)' }}>{current} А</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor() }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--dash-text-secondary)' }}>Статус</span>
          <span className="font-medium" style={{ color: getStatusColor() }}>{getStatusText()}</span>
        </div>
      </div>
    </div>
  );
}
