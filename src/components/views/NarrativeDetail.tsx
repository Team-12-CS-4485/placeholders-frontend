import React from 'react';
import type { Narrative } from '../../types';

interface NarrativeDetailProps {
  narrative: Narrative;
  onBack: () => void;
}

export const NarrativeDetail: React.FC<NarrativeDetailProps> = ({ narrative, onBack }) => {
  const getRiskClass = (score: number) => {
    if (score >= 0.8) return 'risk-high';
    if (score >= 0.4) return 'risk-med';
    return 'risk-low';
  };

  return (
    <section className="view-section">
      <button className="btn-back" onClick={onBack}>&larr; Back to Week Report</button>
      
      <div className="masthead" style={{ borderBottom: '2px solid var(--ink-heavy)', marginBottom: '30px', paddingBottom: '15px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '3rem', textTransform: 'none', letterSpacing: 'normal' }}>{narrative.headline}</h1>
        <p className="lead" style={{ fontSize: '1.3rem', fontStyle: 'italic', marginTop: '10px' }}>{narrative.subheadline}</p>
      </div>

      <div className="newspaper-grid">
        {/* Full Article Body */}
        <div className="col-span-8 article-block">
          {narrative.fullText.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Claims Sidebar */}
        <div className="col-span-4 vertical-divider">
          <h3 style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '15px', paddingBottom: '5px' }}>Extracted Claims</h3>
          
          {narrative.claims.map(claim => (
            <div key={claim.id} className="claim-card">
              <div className="claim-header">
                <div className="profile-pic">{claim.creatorInitials}</div>
                <span className="font-mono" style={{ fontWeight: 'bold' }}>{claim.creatorName}</span>
                <span className={`risk-badge ${getRiskClass(claim.riskScore)}`}>
                  Risk: {claim.riskScore.toFixed(2)}
                </span>
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>"{claim.extractedClaim}"</h4>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--ink-faded)', marginBottom: '10px' }}>
                Transcript: {claim.originalQuote}
              </p>
              <a href={claim.videoUrl} className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-heavy)' }}>[View Source Video]</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};