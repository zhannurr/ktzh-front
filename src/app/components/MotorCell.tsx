interface MotorCellProps {
  label: string;
  temp: number;
  current: number;
  status?: 'ok' | 'warn' | 'crit';
}

export function MotorCell({ label, temp, current, status = 'ok' }: MotorCellProps) {
  const getStatusColor = () => {
    if (status === 'ok') return 'var(--dash-status-ok)';
    if (status === 'warn') return 'var(--dash-status-warn)';
    return 'var(--dash-status-crit)';
  };

  return (
    <div
      className="rounded-lg p-2.5 min-w-[95px] flex flex-col gap-1 border"
      style={{
        backgroundColor: 'var(--dash-bg-cell)',
        borderColor: status === 'warn' ? 'var(--dash-status-warn)' : 'transparent'
      }}
    >
      <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--dash-text-muted)' }}>{label}</div>
      <div className="text-lg font-semibold" style={{ color: status === 'warn' ? 'var(--dash-status-warn)' : 'var(--dash-gold)' }}>
        {temp}°C
      </div>
      <div className="text-xs font-medium" style={{ color: 'var(--dash-text-secondary)' }}>{current} А</div>
    </div>
  );
}
