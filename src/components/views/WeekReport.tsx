import React, { useState } from 'react';
import { mockTrends } from '../../data/mockData';
import type { WeekData } from '../../types';

interface WeekReportProps {
  week: WeekData;
  onReadMore: (id: string) => void;
  onTrendClick: (trendId: string) => void;
}

export const WeekReport: React.FC<WeekReportProps> = ({ week, onReadMore, onTrendClick }) => {
  const [currentSpan, setCurrentSpan] = useState(0);

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>{week.weekName}</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>{week.dateRange}</p>
      </div>

      {/* Weekly Summary */}
      <div style={{ borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '20px', marginBottom: '30px' }}>
        <span className="font-mono" style={{ color: 'var(--ink-faded)', textTransform: 'uppercase' }}>Week summary</span>
        <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>{week.summary.headline}</h2>
        <p style={{ fontSize: '1.1rem' }}>
          {week.summary.content}
        </p>
      </div>

      {/* Newspaper Grid of Narratives */}
      <div style={{ paddingBottom: '20px' }}>
        <span className="font-mono" style={{ color: 'var(--ink-faded)', textTransform: 'uppercase' }}>Narratives</span>
      </div>
      <div className="newspaper-grid">
        {week.narratives.map((narrative, index) => {
          const span = index === 0 ? 8 : 4;
          
          const isNewLine = currentSpan % 12 === 0;
          setCurrentSpan(currentSpan + span);
          
          const colClass = `col-span-${span} ${!isNewLine ? 'vertical-divider' : ''}`.trim();
          
          return (
            <div key={narrative.id} className={`${colClass} article-block`}>
              <h2 
                className="clickable-title"
                style={{ fontSize: index === 0 ? '2.2rem' : '1.6rem', marginBottom: '5px' }}
                onClick={() => onReadMore(narrative.id)}
              >
                {narrative.headline}
              </h2>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px', paddingLeft: '5px' }}>
                {narrative.trendIds.map(tId => {
                  const trend = mockTrends.find(t => t.id === tId);
                  return trend ? (
                    <span key={tId} className="trend-chip" onClick={() => onTrendClick(tId)}>
                      <span className="trend-chip-text">{trend.name}</span>
                    </span>
                  ) : null;
                })}
              </div>

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