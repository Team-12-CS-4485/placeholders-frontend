import React, { useState, useEffect } from 'react';
import type { Claim, Narrative } from '../../types';
import { fetchAllNarratives, fetchNarrativeClaims } from '../../services/api';
import { adaptNarrativesList, adaptClaims } from '../../lib/adapters';

const getRiskLevel = (score: number): 'HIGH' | 'MED' | 'LOW' => {
  if (score >= 0.8) return 'HIGH';
  if (score >= 0.4) return 'MED';
  return 'LOW';
};

const ClaimEntry: React.FC<{ claim: Claim }> = ({ claim }) => {
  const riskLevel = getRiskLevel(claim.riskScore);
  const youtubeHandle = claim.creatorName.startsWith('@') ? claim.creatorName : `@${claim.creatorName}`;

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
          (Source:{' '}
          <a
            href={`https://youtube.com/${youtubeHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="clickable-title"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {claim.creatorName}
          </a>)
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
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const listRes = await fetchAllNarratives();
      const baseNarratives = adaptNarrativesList(listRes.narratives, '');

      // Fetch claims for all narratives in parallel
      const claimResults = await Promise.all(
        listRes.narratives.map(item =>
          fetchNarrativeClaims(item.cluster_id)
            .then(res => ({ id: item.cluster_id.toString(), claims: adaptClaims(res, item.cluster_id.toString()) }))
            .catch(() => ({ id: item.cluster_id.toString(), claims: [] as Claim[] }))
        )
      );

      if (cancelled) return;

      const claimsMap: Record<string, Claim[]> = {};
      claimResults.forEach(r => { claimsMap[r.id] = r.claims; });

      const populated = baseNarratives.map(n => ({
        ...n,
        claims: claimsMap[n.id] ?? [],
      }));

      setNarratives(populated);
      setIsLoading(false);
    }

    load().catch(() => setIsLoading(false));
    return () => { cancelled = true; };
  }, []);

  // Group by unique categories from real data
  const categories = Array.from(new Set(narratives.map(n => n.category)));

  if (isLoading) {
    return (
      <section className="view-section">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>Loading classified intelligence...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view-section">
      <div style={{ textAlign: 'center', borderBottom: '1px solid var(--ink-heavy)', marginBottom: '24px', paddingBottom: '10px' }}>
        <h2>The Classifieds: Extracted Evidence</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
          Categorized Claims → High-Level Narratives
        </p>
      </div>

      <div className="newspaper-grid">
        {categories.map((category, colIdx) => {
          const catNarratives = narratives.filter(n => n.category === category);
          // Limit to 3 columns for layout
          if (colIdx >= 3) return null;
          return (
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

              {catNarratives.length === 0 && (
                <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>
                  No claims in this category.
                </p>
              )}

              {catNarratives.map((narrative, idx) => (
                <div
                  key={narrative.id}
                  style={{
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: idx < catNarratives.length - 1 ? '1px solid var(--ink-heavy)' : 'none',
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

                  {narrative.claims.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', fontStyle: 'italic' }}>No claims extracted.</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
};
