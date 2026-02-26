import React from 'react';
import { mockWeeks } from '../../data/mockData';
import type { Claim } from '../../types';

const CATEGORIES = ['TECH & AI', 'HEALTH & WELLNESS', 'FINANCE & MARKETS'];

const getRiskLevel = (score: number): 'HIGH' | 'MED' | 'LOW' => {
  if (score >= 0.8) return 'HIGH';
  if (score >= 0.4) return 'MED';
  return 'LOW';
};

const ClaimEntry: React.FC<{ claim: Claim }> = ({ claim }) => {
  const riskLevel = getRiskLevel(claim.riskScore);

  return (
    <div style={{ marginBottom: '12px' }}>
      <p style={{ fontSize: '0.9rem', textAlign: 'justify', textIndent: 0 }}>
        <strong>Extracted Claim:</strong>{' '}
        <span
          style={{
            textDecoration: riskLevel === 'HIGH' ? 'line-through' : 'none',
            color: riskLevel === 'HIGH' ? 'var(--ink-faded)' : 'inherit',
          }}
        >
          "{claim.extractedClaim}"
        </span>{' '}
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', fontFamily: "'Courier Prime', monospace" }}>
          (Source: {claim.creatorName})
        </span>
      </p>
      {riskLevel === 'HIGH' && (
        <p
          style={{
            color: '#d90000',
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginTop: '4px',
            textIndent: 0,
          }}
        >
          [SYSTEM WARNING: HIGH RISK CLAIM DETECTED]
        </p>
      )}
    </div>
  );
};

export const Claims: React.FC = () => {
  const allNarratives = mockWeeks.flatMap(w => w.narratives);

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    narratives: allNarratives.filter(n => n.category === cat),
  }));

  return (
    <section className="view-section">
      <div style={{ textAlign: 'center', borderBottom: '1px solid var(--ink-heavy)', marginBottom: '24px', paddingBottom: '10px' }}>
        <h2>The Classifieds: Extracted Evidence</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
          Categorized Claims → High-Level Narratives
        </p>
      </div>

      <div className="newspaper-grid">
        {grouped.map(({ category, narratives }, colIdx) => (
          <div key={category} className={`col-span-4${colIdx > 0 ? ' vertical-divider' : ''}`}>
            <div
              style={{
                backgroundColor: 'var(--ink-heavy)',
                color: 'white',
                padding: '8px 16px',
                marginBottom: '16px',
              }}
            >
              <h3
                style={{
                  color: 'white',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '0.85rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </h3>
            </div>

            {narratives.length === 0 && (
              <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>
                No claims in this category.
              </p>
            )}

            {narratives.map((narrative, idx) => (
              <div
                key={narrative.id}
                style={{
                  marginBottom: '20px',
                  paddingBottom: '20px',
                  borderBottom: idx < narratives.length - 1 ? '1px solid var(--ink-heavy)' : 'none',
                }}
              >
                <p
                  className="font-mono"
                  style={{ fontSize: '0.75rem', color: 'var(--ink-faded)', marginBottom: '6px', textIndent: 0 }}
                >
                  NARRATIVE CLUSTER ID: {narrative.id.toUpperCase()}
                </p>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{narrative.headline}</h4>

                {narrative.claims.map(claim => (
                  <ClaimEntry key={claim.id} claim={claim} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
