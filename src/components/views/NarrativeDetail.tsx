import React, { useEffect, useEffectEvent, useMemo, useState } from 'react';
import type { Narrative, Trend, Claim } from '../../types';
import {
  fetchNarrativeClaims,
  fetchArticles,
  fetchArticleById,
  type BackendArticleDetail,
} from '../../services/api';
import { adaptClaims, parseWeekNumber } from '../../lib/adapters';
import { weekToDateRange } from '../../lib/weekUtils';
import { MarkdownBody } from '../shared/MarkdownBody';

interface NarrativeDetailProps {
  narrative: Narrative;
  trends: Trend[];
  onBack: () => void;
  onTrendClick: (trendId: string) => void;
  onVideoClick: (videoId: string) => void;
  onArticleCached?: (
    weekId: string,
    narrativeId: string,
    article: BackendArticleDetail,
  ) => void;
  onClaimsCached?: (
    weekId: string,
    narrativeId: string,
    narrativeTitle: string,
    claims: Claim[],
  ) => void;
}

export const NarrativeDetail: React.FC<NarrativeDetailProps> = ({
  narrative,
  trends,
  onBack,
  onTrendClick,
  onVideoClick,
  onArticleCached,
  onClaimsCached,
}) => {
  const [article, setArticle] = useState<BackendArticleDetail | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());

  const groupedClaims = useMemo(() => {
    const sorted = [...claims].sort((a, b) => b.riskScore - a.riskScore);
    const map = new Map<string, Claim[]>();
    for (const claim of sorted) {
      const group = map.get(claim.creatorName) ?? [];
      group.push(claim);
      map.set(claim.creatorName, group);
    }
    return [...map.values()];
  }, [claims]);

  const clusterId = +narrative.id;
  const weekNumber = parseWeekNumber(narrative.weekId);
  const emitArticleCached = useEffectEvent((detail: BackendArticleDetail) => {
    onArticleCached?.(narrative.weekId, narrative.id, detail);
  });
  const emitClaimsCached = useEffectEvent((adaptedClaims: Claim[]) => {
    onClaimsCached?.(narrative.weekId, narrative.id, narrative.headline, adaptedClaims);
  });

  // ── Article fetch ───────────────────────────────────────────────────────────
  // Strategy:
  //  1. If we already have an articleId from the week-list prefetch, go direct.
  //  2. Otherwise list with cluster_id + week filter.
  //  3. If that returns nothing, retry without the week filter (handles mis-matched
  //     week numbers between the narratives list and the articles table).
  useEffect(() => {
  let cancelled = false;

  async function load() {
    if (!cancelled) {
      setArticleLoading(true);
      setArticle(null);
    }

    try {
      if (narrative.articleId) {
        const detail = await fetchArticleById(narrative.articleId);
        if (!cancelled) {
          setArticle(detail);
          emitArticleCached(detail);
        }
        return;
      }

      const params: Parameters<typeof fetchArticles>[0] = {
        cluster_id: clusterId,
        limit: 1,
      };
      if (weekNumber !== undefined) params.week = weekNumber;

      let res = await fetchArticles(params);

      if (res.articles.length === 0 && weekNumber !== undefined) {
        res = await fetchArticles({ cluster_id: clusterId, limit: 1 });
      }

      const listItem = res.articles[0];
      if (!listItem) return;

      const detail = await fetchArticleById(listItem.article_id);
      if (!cancelled) {
        setArticle(detail);
        emitArticleCached(detail);
      }
    } catch {
      // optional: handle error
    } finally {
      if (!cancelled) setArticleLoading(false);
    }
  }

  load();
  return () => { cancelled = true; };
}, [clusterId, narrative.articleId, weekNumber]);

  // ── Claims fetch (parallel, independent) ───────────────────────────────────
  useEffect(() => {
  let cancelled = false;

  async function loadClaims() {
    if (!cancelled) setClaimsLoading(true);

    try {
      const res = await fetchNarrativeClaims(clusterId);
      if (!cancelled) {
        const adaptedClaims = adaptClaims(res, narrative.id);
        setClaims(adaptedClaims);
        emitClaimsCached(adaptedClaims);
      }
    } catch {
      // optional
    } finally {
      if (!cancelled) setClaimsLoading(false);
    }
  }

  loadClaims();
  return () => { cancelled = true; };
}, [clusterId, narrative.id]);

  const getRiskClass = (score: number) => {
    if (score >= 0.8) return 'risk-high';
    if (score >= 0.4) return 'risk-med';
    return 'risk-low';
  };

  // Prefer the article title; fall back to the narrative headline
  const displayTitle = article?.title ?? narrative.headline;

  return (
    <section className="view-section">
      <button className="btn-back" onClick={onBack}>
        &larr; Back to Report
      </button>

      {/* ── Masthead ── */}
      <div
        className="masthead"
        style={{
          borderBottom: '2px solid var(--ink-heavy)',
          marginBottom: '30px',
          paddingBottom: '15px',
          textAlign: 'left',
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: '0.72rem',
            color: 'var(--ink-faded)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {narrative.category}
          {article
            ? ` · Week ${article.week_number} · ${weekToDateRange(`week${article.week_number}`)}`
            : ''}
        </p>

        <h1
          style={{
            fontSize: '3rem',
            textTransform: 'none',
            letterSpacing: 'normal',
            marginBottom: '15px',
          }}
        >
          {displayTitle}
        </h1>

        {/* Trend chips */}
        {narrative.trendIds.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '16px',
              paddingLeft: '5px',
            }}
          >
            {narrative.trendIds.map(tId => {
              const trend = trends.find(t => t.id === tId);
              return trend ? (
                <span
                  key={tId}
                  className="trend-chip"
                  onClick={() => onTrendClick(tId)}
                >
                  <span className="trend-chip-text">{trend.name}</span>
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Subheadline = cluster label */}
        <p
          className="lead"
          style={{ fontSize: '1.3rem', fontStyle: 'italic', marginTop: '8px' }}
        >
          {narrative.subheadline}
        </p>
      </div>

      <div className="newspaper-grid">
        {/* ── Article body ── */}
        <div className="col-span-8 article-block">
          {articleLoading && (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)' }}>
              Loading article…
            </p>
          )}

          {!articleLoading && article && (
            <>
              {/* Overview: bold lede paragraph, separated from the body */}
              {article.overview && (
                <p
                  className="lead"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    textIndent: 0,
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px dotted var(--ink-heavy)',
                  }}
                >
                  {article.overview}
                </p>
              )}

              {/* Full body rendered as markdown */}
              {article.body ? (
                <MarkdownBody markdown={article.body} />
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)' }}>
                  Article body is empty.
                </p>
              )}
            </>
          )}

          {/* Fallback: no article generated yet, show narrative summary fields */}
          {!articleLoading && !article && (
            <>
              {narrative.overview && (
                <p
                  className="lead"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    textIndent: 0,
                    marginBottom: '20px',
                  }}
                >
                  {narrative.overview}
                </p>
              )}
              {(narrative.fullText as string[]).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
              <p
                className="font-mono"
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--ink-faded)',
                  marginTop: '24px',
                  borderTop: '1px dotted var(--ink-heavy)',
                  paddingTop: '12px',
                }}
              >
                [Full article not yet generated for this cluster]
              </p>
            </>
          )}
        </div>

        {/* ── Claims sidebar ── */}
        <div className="col-span-4 vertical-divider">
          <h3
            style={{
              borderBottom: '1px solid var(--ink-heavy)',
              marginBottom: '8px',
              paddingBottom: '5px',
            }}
          >
            Extracted Claims
          </h3>
          <p
            className="font-mono"
            style={{ fontSize: '0.68rem', color: 'var(--ink-faded)', marginBottom: '12px' }}
            title="Risk score reflects misinformation potential based on claim verification. HIGH ≥ 0.8 | MED ≥ 0.4 | LOW < 0.4"
          >
            RISK: <span style={{ color: '#d90000' }}>HIGH ≥ 0.8</span> · <span style={{ color: '#b37700' }}>MED ≥ 0.4</span> · <span style={{ color: '#006600' }}>LOW &lt; 0.4</span>
          </p>

          {claimsLoading && (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)', fontSize: '0.9rem' }}>
              Loading claims…
            </p>
          )}

          {!claimsLoading && claims.length === 0 && (
            <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)', fontSize: '0.9rem' }}>
              No claims extracted.
            </p>
          )}

          {groupedClaims.map(group => {
            const primary = group[0];
            const rest = group.slice(1);
            const isExpanded = expandedCreators.has(primary.creatorName);
            const youtubeHandle = primary.creatorName.startsWith('@')
              ? primary.creatorName
              : `@${primary.creatorName}`;

            return (
              <div key={primary.id} className="claim-card">
                <div className="claim-header">
                  <div className="profile-pic">{primary.creatorInitials}</div>

                  <a
                    href={`https://youtube.com/${youtubeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono clickable-title"
                    style={{
                      fontWeight: 'bold',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    {primary.creatorName}
                  </a>

                  <span
                    className={`risk-badge ${getRiskClass(primary.riskScore)}`}
                    title={`Risk score: ${primary.riskScore.toFixed(2)} — reflects misinformation potential (HIGH ≥ 0.8 | MED ≥ 0.4 | LOW < 0.4)`}
                  >
                    {primary.riskScore.toFixed(2)}
                  </span>
                </div>

                {primary.videoId ? (
                  <h4
                    className="clickable-title"
                    style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: 1.3, cursor: 'pointer' }}
                    onClick={() => onVideoClick(primary.videoId!)}
                  >
                    "{primary.extractedClaim}"
                  </h4>
                ) : primary.videoUrl !== '#' ? (
                  <a
                    href={primary.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clickable-title"
                    style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                  >
                    <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: 1.3 }}>
                      "{primary.extractedClaim}"
                    </h4>
                  </a>
                ) : (
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: 1.3 }}>
                    "{primary.extractedClaim}"
                  </h4>
                )}

                {rest.length > 0 && (
                  <button
                    onClick={() =>
                      setExpandedCreators(prev => {
                        const next = new Set(prev);
                        if (next.has(primary.creatorName)) next.delete(primary.creatorName);
                        else next.add(primary.creatorName);
                        return next;
                      })
                    }
                    className="font-mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: 'var(--ink-faded)',
                      padding: '0 0 8px 0',
                      textDecoration: 'underline',
                      display: 'block',
                    }}
                  >
                    {isExpanded ? 'show less' : `+${rest.length} more from this source`}
                  </button>
                )}

                {isExpanded && rest.map(claim => (
                  <div
                    key={claim.id}
                    style={{
                      borderTop: '1px dotted var(--ink-faded)',
                      paddingTop: '8px',
                      marginTop: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      className={`risk-badge ${getRiskClass(claim.riskScore)}`}
                      title={`Risk score: ${claim.riskScore.toFixed(2)}`}
                      style={{ marginBottom: '6px', display: 'inline-block' }}
                    >
                      {claim.riskScore.toFixed(2)}
                    </span>
                    {claim.videoId ? (
                      <h4
                        className="clickable-title"
                        style={{ fontSize: '0.95rem', lineHeight: 1.3, cursor: 'pointer' }}
                        onClick={() => onVideoClick(claim.videoId!)}
                      >
                        "{claim.extractedClaim}"
                      </h4>
                    ) : claim.videoUrl !== '#' ? (
                      <a
                        href={claim.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="clickable-title"
                        style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                      >
                        <h4 style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>
                          "{claim.extractedClaim}"
                        </h4>
                      </a>
                    ) : (
                      <h4 style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>
                        "{claim.extractedClaim}"
                      </h4>
                    )}
                  </div>
                ))}

                {/* Link to video detail if we have a videoId, else YouTube fallback */}
                {primary.videoId ? (
                  <button
                    onClick={() => onVideoClick(primary.videoId!)}
                    className="font-mono clickable-title"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: 'var(--ink-heavy)',
                      padding: 0,
                    }}
                  >
                    [View Source Video]
                  </button>
                ) : primary.videoUrl !== '#' ? (
                  <a
                    href={primary.videoUrl}
                    className="font-mono clickable-title"
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--ink-heavy)',
                      textDecoration: 'none',
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [View Source Video]
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
