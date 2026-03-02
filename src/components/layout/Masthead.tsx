import React from 'react';
import { Ticker } from '../shared/Ticker';

export const Masthead: React.FC = () => {
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
      </div>
      <Ticker />
    </header>
  );
};