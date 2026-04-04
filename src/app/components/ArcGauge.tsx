import React from 'react';

interface ArcGaugeProps {
  value: number;
  max: number;
  unit: string;
  label?: string;
}

export function ArcGauge({ value, max, unit }: ArcGaugeProps) {
  const getColorVar = () => {
    const percentage = (value / max) * 100;
    if (percentage < 71) return '--dash-status-ok';
    if (percentage < 83) return '--dash-status-warn';
    return '--dash-status-crit';
  };

  const colorVar = getColorVar();

  const getComputedColor = () => {
    return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
  };

  const [color, setColor] = React.useState(getComputedColor());
  const [okColor, setOkColor] = React.useState('');
  const [warnColor, setWarnColor] = React.useState('');
  const [critColor, setCritColor] = React.useState('');
  const [bgColor, setBgColor] = React.useState('');

  React.useEffect(() => {
    const root = document.documentElement;
    setColor(getComputedColor());
    setOkColor(getComputedStyle(root).getPropertyValue('--dash-status-ok').trim());
    setWarnColor(getComputedStyle(root).getPropertyValue('--dash-status-warn').trim());
    setCritColor(getComputedStyle(root).getPropertyValue('--dash-status-crit').trim());
    setBgColor(getComputedStyle(root).getPropertyValue('--dash-border-light').trim());
  }, [colorVar]);

  const angle = (value / max) * 180; // 0-180 degrees for half circle

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-20 sm:w-52 sm:h-28">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke={bgColor}
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M 20 90 A 80 80 0 0 1 ${100 + 80 * Math.cos((180 - angle) * Math.PI / 180)} ${90 - 80 * Math.sin((180 - angle) * Math.PI / 180)}`}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 sm:pb-2">
          <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--dash-gold)' }}>
            {value}
          </div>
          <div className="text-xs sm:text-sm font-medium" style={{ color: 'var(--dash-text-secondary)' }}>{unit}</div>
        </div>
      </div>
    </div>
  );
}
