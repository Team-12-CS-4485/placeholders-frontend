import React from 'react';
import { Ticker } from '../shared/Ticker';
import { Highlight } from '../shared/Highlight';
import { mockNarratives } from '../../data/mockData';

interface FrontPageProps {
  onReadMore: (id: string) => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({ onReadMore }) => {
  return (
    <section className="view-section">
      <Ticker />

      {/* Weekly Summary */}
      <div style={{ borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '20px', marginBottom: '30px' }}>
        <span className="font-mono" style={{ color: 'var(--ink-faded)', textTransform: 'uppercase' }}>Weekly Aggregate Summary</span>
        <h2 style={{ fontSize: '1.8rem', marginTop: '10px' }}>AI Disruption and Market Fears Dominate Discourse</h2>
        <p style={{ fontSize: '1.1rem' }}>
          This week's analysis of <Highlight color="yellow">15,000+ videos</Highlight> reveals a strong pivot towards economic anxiety. The primary narratives driving engagement involve the <Highlight color="yellow">automation of entry-level tech jobs</Highlight>, <Highlight color="teal">speculative health diagnostics</Highlight> via wearables, and looming <Highlight color="pink">commercial real estate defaults</Highlight>.
        </p>
      </div>

      {/* Newspaper Grid of Narratives */}
      <div className="newspaper-grid">
        {mockNarratives.map((narrative, index) => {
          const colClass = index === 0 ? 'col-span-8' : 'col-span-4 vertical-divider';
          
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