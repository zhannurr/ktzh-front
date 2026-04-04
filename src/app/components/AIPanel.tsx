interface AIPanelProps {
  loading?: boolean;
  title: string;
  bodyText: string;
  updatedAt: string;
  indexChange?: string;
}

export function AIPanel({ loading = false, title, bodyText, updatedAt, indexChange }: AIPanelProps) {
  return (
    <div className="border-l-4 border rounded-lg p-3" style={{
      backgroundColor: 'var(--dash-ai-purple-bg)',
      borderColor: 'var(--dash-border)',
      borderLeftColor: 'var(--dash-gold)'
    }}>
      <div className="grid grid-cols-[auto_1fr_auto] gap-4">
        {/* Left - AI Badge */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className="border rounded px-2 py-1" style={{
            backgroundColor: 'transparent',
            borderColor: 'var(--dash-ai-purple-border)'
          }}>
            <div className="font-medium text-xs" style={{ color: 'var(--dash-ai-purple-text)' }}>AI</div>
          </div>
          <div className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>
            {loading ? (
              <span className="animate-pulse">думает...</span>
            ) : (
              'Claude'
            )}
          </div>
        </div>

        {/* Center - AI Message */}
        <div className="flex flex-col gap-1.5">
          <div className="text-sm font-semibold" style={{ color: 'var(--dash-status-warn)' }}>{title}</div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--dash-text-primary)' }}>
            {bodyText}
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex flex-col gap-1.5">
            <button className="px-2.5 py-1 text-[10px] border rounded transition-colors font-medium" style={{
              borderColor: 'var(--dash-accent)',
              color: 'var(--dash-accent)'
            }}>
              Снизить тягу
            </button>
            <button className="px-2.5 py-1 text-[10px] transition-colors" style={{
              color: 'var(--dash-text-secondary)'
            }}>
              Подробнее →
            </button>
          </div>
          <div className="border-t pt-1.5" style={{ borderColor: 'var(--dash-border)' }}>
            <div className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>
              обновл. {updatedAt}
            </div>
            {indexChange && (
              <div className="text-[10px]" style={{ color: 'var(--dash-status-warn)' }}>
                индекс: {indexChange}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
