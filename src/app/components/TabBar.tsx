interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasMotorAlert: boolean;
}

export function TabBar({ activeTab, onTabChange, hasMotorAlert }: TabBarProps) {
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'motors', label: 'Двигатели', showBadge: hasMotorAlert },
    { id: 'electrics', label: 'Электрика' },
    { id: 'brakes', label: 'Тормоза и прочее' },
    { id: 'history', label: 'История' },
    { id: 'ai', label: 'AI ассистент' }
  ];

  return (
    <div className="border-b overflow-x-auto" style={{
      borderColor: 'var(--dash-border)',
      borderBottomWidth: '0.5px'
    }}>
      <div className="flex gap-3 sm:gap-5 min-w-min">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-0.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            style={{
              color: activeTab === tab.id ? 'var(--dash-text-primary)' : 'var(--dash-text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--dash-accent)' : 'none',
              marginBottom: activeTab === tab.id ? '-0.5px' : '0'
            }}
          >
            {tab.label}
            {tab.showBadge && (
              <span className="ml-1 sm:ml-1.5 inline-flex items-center justify-center w-3 h-3 sm:w-3.5 sm:h-3.5 text-[8px] sm:text-[9px] font-semibold rounded-full" style={{
                backgroundColor: 'var(--dash-status-warn)',
                color: 'white'
              }}>
                !
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
