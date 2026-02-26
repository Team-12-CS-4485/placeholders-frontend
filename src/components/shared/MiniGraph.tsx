import React from 'react';

interface MiniGraphProps {
  data: number[];
  color?: string;
}

export const MiniGraph: React.FC<MiniGraphProps> = ({ data, color = 'var(--ink-heavy)' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Normalize data to 0-100 for SVG viewBox
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 -5 100 110" width="100%" height="100%" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};