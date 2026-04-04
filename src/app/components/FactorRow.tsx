interface FactorRowProps {
  name: string;
  barWidth: number; // 0-100
  delta: number;
  status?: 'ok' | 'warn' | 'crit';
}

export function FactorRow({ name, barWidth, delta, status = 'ok' }: FactorRowProps) {
  const getStatusColor = () => {
    if (status === 'ok') return 'var(--dash-status-ok)';
    if (status === 'warn') return 'var(--dash-status-warn)';
    return 'var(--dash-status-crit)';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex-1 min-w-0 font-medium" style={{ color: 'var(--dash-text-secondary)' }}>{name}</div>
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--dash-border)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            backgroundColor: getStatusColor()
          }}
        />
      </div>
      <div className="w-8 text-right text-xs font-semibold" style={{ color: getStatusColor() }}>
        {delta}
      </div>
    </div>
  );
}
