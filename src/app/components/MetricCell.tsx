interface MetricCellProps {
  value: string | number;
  unit?: string;
  label: string;
  status?: 'ok' | 'warn' | 'crit';
}

export function MetricCell({ value, unit, label, status = 'ok' }: MetricCellProps) {
  const getStatusColor = () => {
    if (status === 'ok') return 'var(--dash-status-ok)';
    if (status === 'warn') return 'var(--dash-status-warn)';
    return 'var(--dash-status-crit)';
  };

  return (
    <div className="rounded-lg p-2.5 flex flex-col gap-1" style={{ backgroundColor: 'var(--dash-bg-cell)' }}>
      <div className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--dash-text-muted)' }}>{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-semibold" style={{ color: 'var(--dash-gold)' }}>
          {value}
        </span>
        {unit && <span className="text-xs font-medium" style={{ color: 'var(--dash-text-secondary)' }}>{unit}</span>}
      </div>
    </div>
  );
}
