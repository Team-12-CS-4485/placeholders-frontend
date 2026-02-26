import React from 'react';
import type { Trend } from '../../types';
import { MiniGraph } from '../shared/MiniGraph';

interface TrendDetailProps {
  trend: Trend;
  onBack: () => void;
}

export const TrendDetail: React.FC<TrendDetailProps> = ({ trend, onBack }) => {
  return (
    <section className="view-section">
      <button className="btn-back" onClick={onBack}>&larr; Back to Trends</button>
      
      <div className="masthead" style={{ borderBottom: '2px solid var(--ink-heavy)', marginBottom: '30px', paddingBottom: '15px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem', textTransform: 'none' }}>{trend.name}</h1>
        <p className="font-mono" style={{ fontSize: '1rem', marginTop: '10px', color: 'var(--ink-faded)' }}>
          Overall Sentiment: {trend.sentiment} | Total Engagement Index: {trend.totalEngagement}
        </p>
      </div>

      <div className="newspaper-grid">
        <div className="col-span-8 article-block">
          <h3>Detailed Analysis</h3>
          <ul style={{ marginLeft: '20px', marginTop: '15px' }}>
            {trend.detailedAnalysis.map((point, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="col-span-4 vertical-divider article-block">
          <h3>Engagement Over Time (7 Days)</h3>
          <div style={{ height: '200px', border: '1px solid var(--ink-heavy)', padding: '20px', marginTop: '15px', backgroundColor: 'var(--bg-aged)' }}>
            <MiniGraph data={trend.engagementData} color="var(--highlighter-pink)" />
          </div>
        </div>
      </div>
    </section>
  );
};