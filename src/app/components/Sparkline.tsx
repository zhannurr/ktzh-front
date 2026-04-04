import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  // Get computed color if it's a CSS variable
  const [computedColor, setComputedColor] = useState(color);

  useEffect(() => {
    if (color.startsWith('var(')) {
      const varName = color.slice(4, -1);
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      setComputedColor(computed);
    } else {
      setComputedColor(color);
    }
  }, [color]);

  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={computedColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
