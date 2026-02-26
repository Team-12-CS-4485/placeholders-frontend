import React, { useState } from 'react';
import type { Trend } from '../../types';
import { mockWeeks } from '../../data/mockData';

interface TrendDetailProps {
  trend: Trend;
  onBack: () => void;
  onNarrativeClick: (narrativeId: string, weekId: string) => void;
}

export const TrendDetail: React.FC<TrendDetailProps> = ({ trend, onBack, onNarrativeClick }) => {
  const [chartRange, setChartRange] = useState<'30 Days' | '90 Days'>('30 Days');
  const chartData = trend.barChartData[chartRange];
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  const relatedNarratives = mockWeeks.flatMap(w => 
    w.narratives.filter(n => n.trendIds.includes(trend.id)).map(n => ({ ...n, weekId: w.id, weekName: w.weekName }))
  );

  return (
    <section className="view-section">
      <button className="btn-back" onClick={onBack}>&larr; Back to Trends</button>
      
      <div className="masthead" style={{ borderBottom: '2px solid var(--ink-heavy)', marginBottom: '30px', paddingBottom: '15px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem', textTransform: 'none' }}>{trend.name}</h1>
        <p className="font-mono" style={{ fontSize: '1rem', marginTop: '10px', color: 'var(--ink-faded)' }}>
          Overall Sentiment: {trend.overallSentiment} | Recent (7d): {trend.recentSentiment} | Total Engagement Index: {trend.totalEngagement}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
            <h3>Engagement Volume</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setChartRange('30 Days')} 
                style={{ fontWeight: chartRange === '30 Days' ? 'bold' : 'normal', background: 'none', border: '1px solid var(--ink-heavy)', padding: '2px 8px', cursor: 'pointer' }}
              >
                30 Days
              </button>
              <button 
                onClick={() => setChartRange('90 Days')} 
                style={{ fontWeight: chartRange === '90 Days' ? 'bold' : 'normal', background: 'none', border: '1px solid var(--ink-heavy)', padding: '2px 8px', cursor: 'pointer' }}
              >
                90 Days
              </button>
            </div>
          </div>
          
          <div style={{ border: '2px solid var(--ink-heavy)', padding: '20px', height: '250px', display: 'flex', alignItems: 'flex-end', gap: '10px', backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #ccc 20px)', marginTop: '15px' }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{ width: '100%', backgroundColor: 'var(--ink-heavy)', height: `${(d.value / maxVal) * 100}%` }} title={`${d.label}: ${d.value}`}></div>
                </div>
                <span className="font-mono" style={{ fontSize: '0.7rem', marginTop: '5px' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 vertical-divider article-block">
          <h3>Contributing Narratives</h3>
          <ul className="classified-list" style={{ marginTop: '15px', marginBottom: '30px' }}>
            {relatedNarratives.map(n => (
              <li key={n.id} className="classified-item" style={{ cursor: 'pointer' }} onClick={() => onNarrativeClick(n.id, n.weekId)}>
                <span className="classified-meta">{n.weekName}</span>
                <div className="classified-title" style={{ fontSize: '1rem' }}>{n.headline}</div>
              </li>
            ))}
            {relatedNarratives.length === 0 && (
              <li className="classified-item">
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>No narratives found for this trend.</p>
              </li>
            )}
          </ul>

          <h3 className="hl-pink" style={{ display: 'inline-block' }}>Creator Risk Monitor</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Automated toxicity and misinformation tracking for this specific trend.</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontFamily: "'Courier Prime', monospace", fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ink-heavy)', textAlign: 'left' }}>
                <th style={{ padding: '10px 0' }}>CHANNEL ID</th>
                <th style={{ padding: '10px 0' }}>RISK SCORE</th>
              </tr>
            </thead>
            <tbody>
              {trend.creatorRisks.map((risk, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted var(--ink-heavy)' }}>
                  <td style={{ padding: '10px 0' }}>{risk.channelId}</td>
                  <td style={{ padding: '10px 0', color: risk.riskLevel === 'HIGH' ? '#d90000' : 'inherit', fontWeight: risk.riskLevel === 'HIGH' ? 'bold' : 'normal' }}>
                    {risk.score.toFixed(2)} [{risk.riskLevel}]
                  </td>
                </tr>
              ))}
              {trend.creatorRisks.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '10px 0', fontStyle: 'italic', color: 'var(--ink-faded)' }}>No high-risk creators detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};