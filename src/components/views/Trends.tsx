import React, { useState } from 'react';
import { mockTrends, mockCreatorRisks } from '../../data/mockData';
import { MiniGraph } from '../shared/MiniGraph';

interface TrendsProps {
  onSelectTrend: (id: string) => void;
}

export const Trends: React.FC<TrendsProps> = ({ onSelectTrend }) => {
  const [sortOrder, setSortOrder] = useState<'most' | 'least'>('most');

  const sortedTrends = [...mockTrends].sort((a, b) => {
    return sortOrder === 'most' 
      ? b.totalEngagement - a.totalEngagement 
      : a.totalEngagement - b.totalEngagement;
  });

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>Trends Analytics</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Temporal Activity & Creator Risk Scoring</p>
      </div>

      <div className="newspaper-grid">
        {/* Trends List */}
        <div className="col-span-8 article-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '10px' }}>
            <h3>Active Trends</h3>
            <select 
              className="font-mono" 
              style={{ padding: '5px', backgroundColor: 'var(--bg-paper)', border: '1px solid var(--ink-heavy)' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'most' | 'least')}
            >
              <option value="most">Sort: Most Engaging</option>
              <option value="least">Sort: Least Engaging</option>
            </select>
          </div>

          <div>
            {sortedTrends.map(trend => (
              <div key={trend.id} className="trend-row" onClick={() => onSelectTrend(trend.id)}>
                <div className="trend-info">
                  <h4 style={{ fontSize: '1.3rem', marginBottom: '5px' }}>{trend.name}</h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{trend.description}</p>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-faded)' }}>Sentiment: {trend.sentiment}</span>
                </div>
                <div className="trend-graph-container">
                  <MiniGraph data={trend.engagementData} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Risk Monitor (Preserved from original) */}
        <div className="col-span-4 vertical-divider article-block">
          <h3 className="hl-pink" style={{ display: 'inline-block' }}>Creator Risk Monitor</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Automated toxicity and misinformation tracking across monitored channels.</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontFamily: "'Courier Prime', monospace", fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ink-heavy)', textAlign: 'left' }}>
                <th style={{ padding: '10px 0' }}>CHANNEL ID</th>
                <th style={{ padding: '10px 0' }}>RISK SCORE</th>
              </tr>
            </thead>
            <tbody>
              {mockCreatorRisks.filter(r => r.riskLevel !== 'MED').map((risk, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted var(--ink-heavy)' }}>
                  <td style={{ padding: '10px 0' }}>{risk.channelId}</td>
                  <td style={{ padding: '10px 0', color: risk.riskLevel === 'HIGH' ? '#d90000' : 'inherit', fontWeight: risk.riskLevel === 'HIGH' ? 'bold' : 'normal' }}>
                    {risk.score.toFixed(2)} [{risk.riskLevel}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '20px', padding: '15px', border: '1px solid var(--ink-heavy)', backgroundColor: 'var(--bg-aged)' }}>
            <h4 style={{ marginBottom: '5px' }}>Analysis Note:</h4>
            <p style={{ fontSize: '0.85rem', fontFamily: "'Courier Prime', monospace" }}>Elevated risk scores driven by repetitive unverified claims regarding market manipulation and unauthorized medical advice.</p>
          </div>
        </div>
      </div>
    </section>
  );
};