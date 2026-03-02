import React from 'react';
import { mockTickerItems } from '../../data/mockData';

export const Ticker: React.FC = () => {
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {mockTickerItems.map((item, index) => (
          <span key={index} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};