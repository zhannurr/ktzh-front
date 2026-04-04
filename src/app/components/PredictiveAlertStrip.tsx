interface PredictiveAlertStripProps {
  message: string;
  onDismiss: () => void;
}

export function PredictiveAlertStrip({ message, onDismiss }: PredictiveAlertStripProps) {
  return (
    <div className="border rounded-lg p-2.5 flex items-center justify-between mb-3" style={{
      backgroundColor: 'var(--dash-predictive-bg)',
      borderColor: 'var(--dash-predictive-border)',
      borderWidth: '0.5px'
    }}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: '0.5px',
          borderColor: 'var(--dash-status-warn)'
        }}>
          <svg className="w-4 h-4" style={{ color: 'var(--dash-status-warn)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--dash-text-primary)', opacity: 0.9 }}>{message}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>14:32:06</div>
        <button
          onClick={onDismiss}
          className="w-4 h-4 flex items-center justify-center transition-colors"
          style={{ color: 'var(--dash-text-muted)' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}