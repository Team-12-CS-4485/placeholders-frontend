import React, { useState, useEffect } from 'react';
import type { Claim, Narrative, WeekData } from '../../types';
import { fetchNarrativesList, fetchNarrativeClaims } from '../../services/api';
import { adaptNarrativesList, adaptClaims } from '../../lib/adapters';

interface ClaimsProps {
  currentWeekId: string;
  weeks: WeekData[];
}

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
            color: riskLevel === 'HIGH' ? 'var(--ink-faded)' : riskLevel === 'MED' ? '#b85c00' : 'inherit',
          }}
        >
          "{claim.extractedClaim}"
        </span>{' '}
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', fontFamily: "'Courier Prime', monospace" }}>
          (Source:{' '}
          <a
            href={claim.videoUrl && claim.videoUrl !== '#' ? claim.videoUrl : `https://youtube.com/${claim.creatorName.startsWith('@') ? claim.creatorName : `@${claim.creatorName}`}`}
            target="_blank"
            rel="noopener noreferrer"
            className="clickable-title"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {claim.creatorName}
          </a>)
        </span>
      </p>
      {claim.originalQuote && (
        <p
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.78rem',
            color: 'var(--ink-faded)',
            fontStyle: 'italic',
            borderLeft: '2px solid var(--ink-faded)',
            paddingLeft: '8px',
            marginTop: '4px',
            textIndent: 0,
          }}
        >
          "{claim.originalQuote}"
        </p>
      )}
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
      {riskLevel === 'MED' && (
        <p
          style={{
            color: '#b85c00',
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.8rem',
            fontWeight: 'bold',
            marginTop: '4px',
            textIndent: 0,
          }}
        >
          [ELEVATED RISK]
        </p>
      )}
    </div>
  );
};

export const Claims: React.FC<ClaimsProps> = ({ currentWeekId, weeks }) => {
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep selectedWeekId in sync if parent changes the current week
  useEffect(() => {
    setSelectedWeekId(currentWeekId);
  }, [currentWeekId]);

  useEffect(() => {
    if (!selectedWeekId) return;
    let cancelled = false;
    setIsLoading(true);

    async function load() {
      const weekRes = await fetchNarrativesList(selectedWeekId);
      const baseNarratives = adaptNarrativesList(weekRes.narratives, selectedWeekId);

      const claimResults = await Promise.all(
        weekRes.narratives.map((item: { cluster_id: number }) =>
          fetchNarrativeClaims(item.cluster_id)
            .then(res => ({ id: item.cluster_id.toString(), claims: adaptClaims(res, item.cluster_id.toString()) }))
            .catch(() => ({ id: item.cluster_id.toString(), claims: [] as Claim[] }))
        )
      );

      if (cancelled) return;

      const claimsMap: Record<string, Claim[]> = {};
      claimResults.forEach((r: { id: string; claims: Claim[] }) => { claimsMap[r.id] = r.claims; });

      const populated = baseNarratives.map((n: Narrative) => ({
        ...n,
        claims: (claimsMap[n.id] ?? []).sort((a, b) => b.riskScore - a.riskScore),
      }));

      setNarratives(populated);
      setIsLoading(false);
    }

    load().catch(() => setIsLoading(false));
    return () => { cancelled = true; };
  }, [selectedWeekId]);

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);
  const categories = Array.from(new Set(narratives.map(n => n.category).filter(Boolean)));

  return (
    <section className="view-section">
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid var(--ink-heavy)', marginBottom: '24px', paddingBottom: '10px' }}>
        <h2>The Classifieds: Extracted Evidence</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
          Categorized Claims → High-Level Narratives
        </p>

        {/* Week picker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <label
            htmlFor="claims-week-select"
            className="font-mono"
            style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            Week:
          </label>
          <select
            id="claims-week-select"
            value={selectedWeekId}
            onChange={e => setSelectedWeekId(e.target.value)}
            className="font-mono"
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: '0.85rem',
              border: '1px solid var(--ink-heavy)',
              background: 'var(--paper)',
              color: 'var(--ink-heavy)',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {weeks.map(w => (
              <option key={w.id} value={w.id}>
                {w.weekName} | {w.dateRange}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>
            Loading classified intelligence for {selectedWeek?.weekName ?? selectedWeekId}...
          </p>
        </div>
      ) : (
        <div className="newspaper-grid">
          {categories.length === 0 && (
            <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', gridColumn: '1 / -1' }}>
              No claims found for {selectedWeek?.weekName ?? selectedWeekId}.
            </p>
          )}

          {categories.map((category, colIdx) => {
            const catNarratives = narratives.filter(n => n.category === category);
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

                {catNarratives.map((narrative, idx) => {
                  const claimCount = narrative.claims.length;
                  return (
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
                        {claimCount > 0 && (
                          <span style={{ marginLeft: '8px' }}>· {claimCount} claim{claimCount !== 1 ? 's' : ''}</span>
                        )}
                      </p>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>{narrative.headline}</h4>

                      {narrative.claims.map(claim => (
                        <ClaimEntry key={claim.id} claim={claim} />
                      ))}

                      {narrative.claims.length === 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', fontStyle: 'italic' }}>No claims extracted.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
