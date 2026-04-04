interface ParamRowProps {
  name: string;
  value: string | number;
  unit?: string;
  status?: 'ok' | 'warn' | 'crit';
}

export function ParamRow({ name, value, unit, status = 'ok' }: ParamRowProps) {
  const getStatusColor = () => {
    if (status === 'ok') return 'var(--dash-status-ok)';
    if (status === 'warn') return 'var(--dash-status-warn)';
    return 'var(--dash-status-crit)';
  };

  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <div className="font-medium" style={{ color: 'var(--dash-text-secondary)' }}>{name}</div>
      <div className="flex items-center gap-2">
        <span className="font-semibold" style={{ color: 'var(--dash-gold)' }}>
          {value} {unit}
        </span>
        {status && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
        )}
      </div>
    </div>
  );
}
