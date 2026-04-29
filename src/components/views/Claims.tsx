import React, { useEffect, useEffectEvent, useState } from 'react';
import type { Claim, Narrative, WeekData } from '../../types';
import { fetchNarrativesList, fetchNarrativeClaims } from '../../services/api';
import { adaptNarrativesList, adaptClaims } from '../../lib/adapters';

interface ClaimsProps {
  currentWeekId: string;
  weeks: WeekData[];
  onClaimsCached?: (
    entries: Array<{
      weekId: string;
      narrativeId: string;
      narrativeTitle: string;
      claims: Claim[];
    }>,
  ) => void;
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
          title={`Risk: ${riskLevel} (${claim.riskScore.toFixed(2)}) — reflects misinformation potential (HIGH ≥ 0.8 | MED ≥ 0.4 | LOW < 0.4)`}
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

const CLAIMS_PER_COLUMN = 5;

const CLAIM_COLUMNS: { type: 'consensus' | 'debated' | 'unique'; label: string }[] = [
  { type: 'consensus', label: 'Consensus' },
  { type: 'debated',   label: 'Debated'   },
  { type: 'unique',    label: 'Unique'     },
];

export const Claims: React.FC<ClaimsProps> = ({
  currentWeekId,
  weeks,
  onClaimsCached,
}) => {
  return <ClaimsPanel key={currentWeekId} currentWeekId={currentWeekId} weeks={weeks} onClaimsCached={onClaimsCached} />;
};

const ClaimsPanel: React.FC<ClaimsProps> = ({
  currentWeekId,
  weeks,
  onClaimsCached,
}) => {
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCols, setExpandedCols] = useState<Set<'consensus' | 'debated' | 'unique'>>(new Set());
  const emitClaimsCached = useEffectEvent(
    (
      entries: Array<{
        weekId: string;
        narrativeId: string;
        narrativeTitle: string;
        claims: Claim[];
      }>,
    ) => {
      onClaimsCached?.(entries);
    },
  );

  useEffect(() => {
    if (!selectedWeekId) return;
    let cancelled = false;

    async function load() {
      const weekRes = await fetchNarrativesList(selectedWeekId);
      const baseNarratives = adaptNarrativesList(weekRes.narratives, selectedWeekId);

      const claimResults = await Promise.all(
        weekRes.narratives.map((item: { cluster_id: number }) =>
          fetchNarrativeClaims(item.cluster_id, selectedWeekId)
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
      emitClaimsCached(
        populated.map((narrative: Narrative) => ({
          weekId: selectedWeekId,
          narrativeId: narrative.id,
          narrativeTitle: narrative.headline,
          claims: narrative.claims,
        })),
      );
      setIsLoading(false);
    }

    load().catch(() => setIsLoading(false));
    return () => { cancelled = true; };
  }, [selectedWeekId]);

  const selectedWeek = weeks.find(w => w.id === selectedWeekId);

  // Flatten all claims across narratives, grouped by claimType
  const allClaims = narratives.flatMap(n => n.claims);

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
            onChange={e => {
              setIsLoading(true);
              setExpandedCols(new Set());
              setSelectedWeekId(e.target.value);
            }}
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
          {allClaims.length === 0 && (
            <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', gridColumn: '1 / -1' }}>
              No claims found for {selectedWeek?.weekName ?? selectedWeekId}.
            </p>
          )}

          {CLAIM_COLUMNS.map((col, colIdx) => {
            const colClaims = allClaims
              .filter(c => c.claimType === col.type)
              .sort((a, b) => b.riskScore - a.riskScore);
            const isExpanded = expandedCols.has(col.type);
            const visibleClaims = isExpanded ? colClaims : colClaims.slice(0, CLAIMS_PER_COLUMN);
            const hiddenCount = colClaims.length - visibleClaims.length;

            return (
              <div key={col.type} className={`col-span-4${colIdx > 0 ? ' vertical-divider' : ''}`}>
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
                    {col.label}
                  </h3>
                </div>

                {colClaims.length === 0 && (
                  <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>
                    No {col.label.toLowerCase()} claims this week.
                  </p>
                )}

                {visibleClaims.map((claim, idx) => (
                  <div
                    key={claim.id}
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: idx < visibleClaims.length - 1 || hiddenCount > 0 ? '1px solid var(--ink-heavy)' : 'none',
                    }}
                  >
                    <ClaimEntry claim={claim} />
                  </div>
                ))}

                {colClaims.length > CLAIMS_PER_COLUMN && (
                  <button
                    onClick={() =>
                      setExpandedCols(prev => {
                        const next = new Set(prev);
                        if (next.has(col.type)) next.delete(col.type);
                        else next.add(col.type);
                        return next;
                      })
                    }
                    className="font-mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: 'var(--ink-faded)',
                      padding: '4px 0 0 0',
                      textDecoration: 'underline',
                      display: 'block',
                    }}
                  >
                    {isExpanded ? 'Show less' : `+${hiddenCount} more claims`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
