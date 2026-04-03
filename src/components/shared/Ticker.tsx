import React from 'react';

interface TickerProps {
  items: string[];
}

export const Ticker: React.FC<TickerProps> = ({ items }) => {
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {items.map((item, index) => (
          <span key={index} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};
