import React from 'react';
import { Ticker } from '../shared/Ticker';
import { mockNarratives, mockWeeklySummary } from '../../data/mockData';

interface FrontPageProps {
  onReadMore: (id: string) => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({ onReadMore }) => {
  let currentSpan = 0;

  return (
    <section className="view-section">
      <Ticker />

      {/* Weekly Summary */}
      <div style={{ borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '20px', marginBottom: '30px' }}>
        <span className="font-mono" style={{ color: 'var(--ink-faded)', textTransform: 'uppercase' }}>{mockWeeklySummary.dateRange}</span>
        <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>{mockWeeklySummary.headline}</h2>
        <p style={{ fontSize: '1.1rem' }}>
          {mockWeeklySummary.content}
        </p>
      </div>

      {/* Newspaper Grid of Narratives */}
      <div className="newspaper-grid">
        {mockNarratives.map((narrative, index) => {
          const span = index === 0 ? 8 : 4;
          
          // Check if this block starts a new line (multiples of 12 columns)
          const isNewLine = currentSpan % 12 === 0;
          currentSpan += span;
          
          const colClass = `col-span-${span} ${!isNewLine ? 'vertical-divider' : ''}`.trim();
          
          return (
            <div key={narrative.id} className={`${colClass} article-block`}>
              <h2 style={{ fontSize: index === 0 ? '2.2rem' : '1.6rem' }}>{narrative.headline}</h2>
              <p className="lead" style={{ marginBottom: '15px' }}>{narrative.subheadline}</p>
              <p>{narrative.summary}</p>
              <button 
                className="btn-link" 
                onClick={() => onReadMore(narrative.id)}
              >
                Continued on page {narrative.pageNumber} &rarr;
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};