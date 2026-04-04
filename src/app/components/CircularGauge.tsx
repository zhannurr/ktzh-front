import React from 'react';

interface CircularGaugeProps {
  value: number; // 0-100
  label: string;
}

export function CircularGauge({ value, label }: CircularGaugeProps) {
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Determine color based on value: >80 = green, 50-80 = amber, <50 = red
  const getColorVar = () => {
    if (value > 80) return '--dash-status-ok';
    if (value >= 50) return '--dash-status-warn';
    return '--dash-status-crit';
  };

  const colorVar = getColorVar();
  const statusLabel = value > 80 ? 'Норма' : value >= 50 ? 'Внимание' : 'Тревога';

  // Get computed color for SVG
  const getComputedColor = () => {
    return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
  };

  const [color, setColor] = React.useState(getComputedColor());

  React.useEffect(() => {
    setColor(getComputedColor());
  }, [colorVar]);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 scale-90 sm:scale-100">
        {/* Background circle */}
        <circle
          stroke="var(--dash-border-light)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Center value - number and "/ 100" */}
        <g className="transform rotate-90" style={{ transformOrigin: 'center' }}>
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            style={{ fontSize: '52px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}
          >
            {value}
          </text>
          <text
            x="50%"
            y="65%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            style={{ fontSize: '18px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', opacity: 0.6 }}
          >
            / 100
          </text>
        </g>
      </svg>
      <div
        className="px-3 py-1 rounded-full text-sm font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color: color
        }}
      >
        {statusLabel}
      </div>
    </div>
  );
}