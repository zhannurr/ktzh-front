interface RouteMapProps {
  stationList: string[];
  currentKm: number;
  totalKm: number;
}

export function RouteMap({ stationList, currentKm, totalKm }: RouteMapProps) {
  const progress = (currentKm / totalKm) * 100;

  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      

      {/* Vertical route line */}
      <div className="flex items-center gap-3 px-3">
        <div className="flex flex-col gap-3 w-full relative">
          {/* Stations row */}
          <div className="flex items-start justify-between relative">
            {/* Start station */}
            <div className="flex flex-col items-start gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{
                backgroundColor: 'var(--dash-accent)',
                boxShadow: '0 0 4px var(--dash-accent)'
              }} />
              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--dash-text-primary)' }}>{stationList[0]}</span>
            </div>

            {/* End station */}
            <div className="flex flex-col items-end gap-1">
              <div className="w-2.5 h-2.5 rounded-full border" style={{
                borderColor: 'var(--dash-border)',
                backgroundColor: 'var(--dash-bg-page)'
              }} />
              <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--dash-text-primary)' }}>{stationList[1]}</span>
            </div>

            {/* Route line with progress (horizontal) */}
            <div className="absolute left-3 right-3 top-[4px] h-0.5" style={{ backgroundColor: 'var(--dash-border)' }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: 'var(--dash-accent)'
                }}
              />
            </div>

            {/* Current position marker */}
            <div className="absolute top-0 -translate-x-1/2 z-10" style={{ left: `calc(12px + (100% - 24px) * ${progress / 100})` }}>
              <div className="w-3 h-3 rounded-full" style={{
                backgroundColor: 'var(--dash-gold)',
                boxShadow: '0 0 6px var(--dash-gold)',
                border: '2px solid var(--dash-bg-card)'
              }} />
            </div>
          </div>

          {/* Progress info */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--dash-gold)' }}>км {currentKm}</span>
            <span className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>•</span>
            <span className="text-[10px]" style={{ color: 'var(--dash-text-muted)' }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-center" style={{ color: 'var(--dash-text-muted)' }}>
        {currentKm} / {totalKm} км
      </div>
    </div>
  );
}
