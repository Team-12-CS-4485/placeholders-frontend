import React from 'react';

interface HighlightProps {
  color: 'yellow' | 'pink' | 'teal';
  children: React.ReactNode;
}

export const Highlight: React.FC<HighlightProps> = ({ color, children }) => {
  return <span className={`hl-${color}`}>{children}</span>;
};