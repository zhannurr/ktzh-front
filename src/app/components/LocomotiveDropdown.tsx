import { useState, useRef, useEffect } from 'react';

interface Locomotive {
  id: string;
  name: string;
  route: string;
  type: 'KZ8A' | 'ТЭ33А';
  status: 'ok' | 'warn' | 'critical';
}

interface LocomotiveDropdownProps {
  selected: Locomotive;
  locomotives: Locomotive[];
  onSelect: (locomotive: Locomotive) => void;
}

export function LocomotiveDropdown({ selected, locomotives, onSelect }: LocomotiveDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'var(--dash-status-ok)';
      case 'warn':
        return 'var(--dash-status-warn)';
      case 'critical':
        return '#ef4444';
      default:
        return 'var(--dash-status-ok)';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded border transition-all font-semibold flex items-center gap-1 sm:gap-2 hover:bg-opacity-50"
        style={{
          borderColor: 'var(--dash-border)',
          borderWidth: '0.5px',
          color: 'var(--dash-text-primary)',
          backgroundColor: 'var(--dash-bg-card)'
        }}
      >
        <span className="text-xs sm:text-sm">{selected.name}</span>
        <svg
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--dash-text-secondary)'
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-1 left-0 sm:left-auto sm:right-0 rounded-lg border overflow-hidden shadow-lg z-50 max-w-[calc(100vw-2rem)]"
          style={{
            backgroundColor: 'var(--dash-bg-card)',
            borderColor: 'var(--dash-border)',
            borderWidth: '0.5px',
            minWidth: '280px'
          }}
        >
          {locomotives.map((loco) => (
            <button
              key={loco.id}
              onClick={() => {
                onSelect(loco);
                setIsOpen(false);
              }}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-2.5 transition-colors border-b"
              style={{
                backgroundColor: selected.id === loco.id ? 'rgba(240, 192, 64, 0.1)' : 'transparent',
                borderColor: 'var(--dash-border)',
                borderBottomWidth: '0.5px'
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getStatusColor(loco.status),
                  boxShadow: `0 0 6px ${getStatusColor(loco.status)}`
                }}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'var(--dash-text-primary)' }}>
                  {loco.name}
                </div>
                <div className="text-[10px] sm:text-xs truncate" style={{ color: 'var(--dash-text-secondary)' }}>
                  {loco.route}
                </div>
              </div>
              {selected.id === loco.id && (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: 'var(--dash-gold)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
