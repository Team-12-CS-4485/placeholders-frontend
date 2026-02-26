import React from 'react';
import { mockCreatorRisks } from '../../data/mockData';

export const Business: React.FC = () => {
  const barStyle: React.CSSProperties = {
    flex: 1,
    background: 'repeating-linear-gradient(45deg, #111, #111 2px, transparent 2px, transparent 4px)'
  };

  const solidBarStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'var(--ink-heavy)'
  };

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>Business Section: Trend Analytics</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Temporal Activity & Creator Risk Scoring</p>
      </div>

      <div className="newspaper-grid">
        <div className="col-span-8 article-block">
          <h3>Narrative Momentum (30-Day Index)</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Analysis of engagement volume against time for top tracked clusters.</p>
          
          {/* Mocked Data Chart */}
          <div style={{ border: '2px solid var(--ink-heavy)', padding: '20px', height: '300px', display: 'flex', alignItems: 'flex-end', gap: '10px', backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #ccc 20px)', marginBottom: '20px' }}>
            <div style={{ ...barStyle, height: '20%' }} title="AI Jobs: Week 1"></div>
            <div style={{ ...barStyle, height: '35%' }} title="AI Jobs: Week 2"></div>
            <div style={{ ...barStyle, height: '80%', border: '3px solid var(--highlighter-yellow)' }} title="AI Jobs: Week 3"></div>
            <div style={{ ...barStyle, height: '65%' }} title="AI Jobs: Week 4"></div>
            
            <div style={{ width: '2px', height: '100%', background: 'var(--ink-heavy)', margin: '0 10px' }}></div>
            
            <div style={{ ...solidBarStyle, height: '40%' }} title="Health Tech: Week 1"></div>
            <div style={{ ...solidBarStyle, height: '45%' }} title="Health Tech: Week 2"></div>
            <div style={{ ...solidBarStyle, height: '50%' }} title="Health Tech: Week 3"></div>
            <div style={{ ...solidBarStyle, height: '55%' }} title="Health Tech: Week 4"></div>
          </div>
          <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem' }}>
            <span>NARRATIVE A: AI & JOBS</span>
            <span>NARRATIVE B: HEALTH TECH</span>
          </div>
        </div>

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
              {mockCreatorRisks.map((risk, idx) => (
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
            <p style={{ fontSize: '0.85rem', fontFamily: "'Courier Prime', monospace" }}>Elevated risk scores driven by repetitive unverified claims regarding market manipulation and unauthorized medical advice. Action recommended for brand safety.</p>
          </div>
        </div>
      </div>
    </section>
  );
};