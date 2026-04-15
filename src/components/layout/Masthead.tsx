import React from 'react';
import { Ticker } from '../shared/Ticker';

interface MastheadProps {
  tickerItems: string[];
  onRefresh?: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({ tickerItems, onRefresh }) => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  const currentDate = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <header className="masthead">
      <h1>Newsify</h1>
      <div style={{ fontStyle: 'italic', fontSize: '1.1rem', marginTop: '-5px' }}>
        The Investigative Archive - YouTube Intelligence
      </div>
      <div className="sub-meta">
        <span>Vol. CXCIV ... No. 59,321</span>
        <span>Automated Weekly Digest</span>
        <span>{currentDate}</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh data"
            style={{
              background: 'none',
              border: '1px solid var(--ink-faded)',
              cursor: 'pointer',
              color: 'var(--ink-faded)',
              fontFamily: 'inherit',
              fontSize: '0.75rem',
              padding: '1px 6px',
              letterSpacing: '0.05em',
            }}
          >
            ↻ Refresh
          </button>
        )}
      </div>
      <Ticker items={tickerItems} />
    </header>
  );
};