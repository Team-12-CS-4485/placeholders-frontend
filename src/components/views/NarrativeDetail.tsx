import React, { useState, useEffect } from 'react';
import type { Narrative, Trend } from '../../types';
import { fetchNarrativeDetail, fetchNarrativeClaims } from '../../services/api';
import { adaptNarrativeDetail } from '../../lib/adapters';

interface NarrativeDetailProps {
  narrative: Narrative;
  trends: Trend[];
  onBack: () => void;
  onTrendClick: (trendId: string) => void;
}

export const NarrativeDetail: React.FC<NarrativeDetailProps> = ({ narrative, trends, onBack, onTrendClick }) => {
  const [fullNarrative, setFullNarrative] = useState<Narrative | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchNarrativeDetail(+narrative.id),
      fetchNarrativeClaims(+narrative.id),
    ])
      .then(([detail, claims]) => {
        if (!cancelled) setFullNarrative(adaptNarrativeDetail(detail, claims, narrative.weekId));
      })
      .catch(() => { /* keep showing list-level data */ });
    return () => { cancelled = true; };
  }, [narrative.id, narrative.weekId]);

  const display = fullNarrative ?? narrative;

  const getRiskClass = (score: number) => {
    if (score >= 0.8) return 'risk-high';
    if (score >= 0.4) return 'risk-med';
    return 'risk-low';
  };

  return (
    <section className="view-section">
      <button className="btn-back" onClick={onBack}>&larr; Back to Report</button>

      <div className="masthead" style={{ borderBottom: '2px solid var(--ink-heavy)', marginBottom: '30px', paddingBottom: '15px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '3rem', textTransform: 'none', letterSpacing: 'normal', marginBottom: '15px' }}>{display.headline}</h1>

        {/* Trend Chips */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', paddingLeft: '5px' }}>
          {display.trendIds.map(tId => {
            const trend = trends.find(t => t.id === tId);
            return trend ? (
              <span key={tId} className="trend-chip" onClick={() => onTrendClick(tId)}>
                <span className="trend-chip-text">{trend.name}</span>
              </span>
            ) : null;
          })}
        </div>

        <p className="lead" style={{ fontSize: '1.3rem', fontStyle: 'italic', marginTop: '10px' }}>{display.subheadline}</p>
      </div>

      <div className="newspaper-grid">
        {/* Full Article Body */}
        <div className="col-span-8 article-block">
          {display.fullText.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          {display.fullText.length === 0 && (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)' }}>Loading article content...</p>
          )}
        </div>

        {/* Claims Sidebar */}
        <div className="col-span-4 vertical-divider">
          <h3 style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '15px', paddingBottom: '5px' }}>Extracted Claims</h3>

          {display.claims.length === 0 && (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)', fontSize: '0.9rem' }}>
              {fullNarrative ? 'No claims extracted.' : 'Loading claims...'}
            </p>
          )}

          {display.claims.map(claim => {
            const youtubeHandle = claim.creatorName.startsWith('@') ? claim.creatorName : `@${claim.creatorName}`;

            return (
              <div key={claim.id} className="claim-card">
                <div className="claim-header">
                  <div className="profile-pic">{claim.creatorInitials}</div>

                  <a
                    href={`https://youtube.com/${youtubeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono clickable-title"
                    style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}
                  >
                    {claim.creatorName}
                  </a>

                  <span className={`risk-badge ${getRiskClass(claim.riskScore)}`}>
                    Risk: {claim.riskScore.toFixed(2)}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>"{claim.extractedClaim}"</h4>
                {claim.originalQuote && (
                  <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--ink-faded)', marginBottom: '10px' }}>
                    Transcript: {claim.originalQuote}
                  </p>
                )}
                <a href={claim.videoUrl} className="font-mono clickable-title" style={{ fontSize: '0.8rem', color: 'var(--ink-heavy)', textDecoration: 'none' }}>[View Source Video]</a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
