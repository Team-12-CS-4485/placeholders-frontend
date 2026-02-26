import React from 'react';
import { Highlight } from '../shared/Highlight';

export const Classifieds: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--ink-heavy)',
    color: 'var(--bg-paper)',
    padding: '5px',
    textAlign: 'center'
  };

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>The Classifieds: Extracted Evidence</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Categorized Claims -&gt; High-Level Narratives</p>
      </div>

      <div className="newspaper-grid">
        {/* Column 1: AI */}
        <div className="col-span-4 article-block">
          <h3 style={headerStyle}>TECH & AI</h3>
          <ul className="classified-list">
            <li className="classified-item">
              <span className="classified-meta">Narrative Cluster ID: 409</span>
              <div className="classified-title">Hardware Acceleration Limits</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> <Highlight color="yellow">"Nvidia GPU shortages will throttle AI startups by Q3."</Highlight> (Source: TechDaily, 1.2M views)</p>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> "Alternative chipmakers cannot meet current LLM training demands."</p>
            </li>
            <li className="classified-item">
              <span className="classified-meta">Narrative Cluster ID: 412</span>
              <div className="classified-title">Software Engineering</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> <Highlight color="yellow">"AI tools increase developer productivity by 40%."</Highlight></p>
            </li>
          </ul>
        </div>

        {/* Column 2: Health */}
        <div className="col-span-4 vertical-divider article-block">
          <h3 style={headerStyle}>HEALTH & WELLNESS</h3>
          <ul className="classified-list">
            <li className="classified-item">
              <span className="classified-meta">Narrative Cluster ID: 811</span>
              <div className="classified-title">Wearable Diagnostics</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> <Highlight color="teal">"Smart rings accurately predict fever onset 24 hours prior."</Highlight> (Source: DrMed, 400K views)</p>
            </li>
            <li className="classified-item">
              <span className="classified-meta">Narrative Cluster ID: 815</span>
              <div className="classified-title hl-pink">Weight Loss Injections</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> "Over-the-counter alternatives yield identical results to prescription GLP-1s." <br/><span className="font-mono" style={{ color: 'red', fontSize: '0.8rem' }}>[SYSTEM WARNING: HIGH RISK MEDICAL MISINFO]</span></p>
            </li>
          </ul>
        </div>

        {/* Column 3: Finance */}
        <div className="col-span-4 vertical-divider article-block">
          <h3 style={headerStyle}>FINANCE & MARKETS</h3>
          <ul className="classified-list">
            <li className="classified-item">
              <span className="classified-meta">Narrative Cluster ID: 204</span>
              <div className="classified-title">Housing Market Correction</div>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> "Commercial real estate defaults will trigger a 2008-style banking crisis."</p>
              <p style={{ fontSize: '0.9rem' }}><strong>Extracted Claim:</strong> <Highlight color="yellow">"Interest rate drops are fully priced into current valuations."</Highlight></p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};