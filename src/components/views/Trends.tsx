import React, { useState } from 'react';
import { mockTrends, mockTrendAlerts } from '../../data/mockData';
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

  const getAlertColor = (type: string) => {
    if (type === 'WARNING') return 'var(--highlighter-pink)';
    if (type === 'SHIFT') return 'var(--highlighter-yellow)';
    return 'var(--highlighter-teal)';
  };

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>Trends Analytics</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Temporal Activity & Market Shifts</p>
      </div>

      <div className="newspaper-grid">
        <div className="col-span-8 article-block">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '10px' }}>
            <h3>All Trends</h3>
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
                  <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', display: 'flex', gap: '15px' }}>
                    <span>Overall: {trend.overallSentiment}</span>
                    <span>Recent (7d): {trend.recentSentiment}</span>
                  </div>
                </div>
                
                <div className="trend-graph-container" style={{ width: '200px', height: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '45px', width: '100%' }}>
                    <MiniGraph data={trend.engagementData.map(d => d.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontFamily: 'monospace', marginTop: '4px' }}>
                    <span>{trend.engagementData[0].date}</span>
                    <span>{trend.engagementData[trend.engagementData.length - 1].date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* NEW: Market Shifts & Alerts */}
        <div className="col-span-4 vertical-divider article-block">
          <h3 style={{ borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '10px', marginBottom: '15px' }}>
            Market Shifts & Alerts
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {mockTrendAlerts.map(alert => (
              <div key={alert.id} style={{ border: '1px solid var(--ink-heavy)', padding: '15px', backgroundColor: 'var(--bg-aged)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="font-mono" style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold', 
                    backgroundColor: getAlertColor(alert.type), 
                    padding: '2px 6px', 
                    border: '1px solid var(--ink-heavy)' 
                  }}>
                    {alert.type}
                  </span>
                </div>
                {/* Added clickable-title class here */}
                <h4 className="clickable-title" style={{ fontSize: '1.1rem', marginBottom: '5px', lineHeight: 1.2 }}>{alert.headline}</h4>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};