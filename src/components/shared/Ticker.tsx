import React from 'react';

const TICKER_ITEMS = [
  'BREAKING: "GPT-5 writes production Python" [CONF: 92%]',
  "RISK ALERT: Spikes in medical misinformation regarding 'Ozempic'",
  "TRENDING: 'AI Automation in Manufacturing' +300% engagement in 24hrs",
  "SENTIMENT SHIFT: 'Tech Layoffs 2026' leaning 78% negative"
];

export const Ticker: React.FC = () => {
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {TICKER_ITEMS.map((item, index) => (
          <span key={index} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};