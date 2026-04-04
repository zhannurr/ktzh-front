interface EventCardProps {
  timestamp: string;
  title: string;
  description: string;
  badge: 'active' | 'warning' | 'ok';
}

export function EventCard({ timestamp, title, description, badge }: EventCardProps) {
  const getBadgeConfig = () => {
    if (badge === 'active') return { text: 'Активен', color: 'var(--dash-status-warn)' };
    if (badge === 'warning') return { text: 'Внимание', color: 'var(--dash-status-warn)' };
    return { text: 'ОК', color: 'var(--dash-status-ok)' };
  };

  const badgeConfig = getBadgeConfig();

  return (
    <div
      className="border rounded-lg p-3 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--dash-bg-card)',
        borderColor: 'var(--dash-border)',
        borderWidth: '0.5px'
      }}
    >
      <div className="flex-1">
        <div className="text-[10px] mb-1 font-medium" style={{ color: 'var(--dash-text-muted)' }}>
          {timestamp}
        </div>
        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--dash-text-primary)' }}>
          {title}
        </div>
        <div className="text-[10px]" style={{ color: 'var(--dash-text-secondary)' }}>
          {description}
        </div>
      </div>

      <div
        className="px-2 py-0.5 rounded text-[10px] font-medium ml-3"
        style={{
          backgroundColor: `${badgeConfig.color}20`,
          color: badgeConfig.color
        }}
      >
        {badgeConfig.text}
      </div>
    </div>
  );
}
