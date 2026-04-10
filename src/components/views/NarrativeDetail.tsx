import React, { useState, useEffect } from 'react';
import type { Narrative, Trend, Claim } from '../../types';
import {
  fetchNarrativeClaims,
  fetchArticles,
  fetchArticleById,
  type BackendArticleDetail,
} from '../../services/api';
import { adaptClaims, parseWeekNumber } from '../../lib/adapters';
import { MarkdownBody } from '../shared/MarkdownBody';

interface NarrativeDetailProps {
  narrative: Narrative;
  trends: Trend[];
  onBack: () => void;
  onTrendClick: (trendId: string) => void;
  onVideoClick: (videoId: string) => void;
}

export const NarrativeDetail: React.FC<NarrativeDetailProps> = ({
  narrative,
  trends,
  onBack,
  onTrendClick,
  onVideoClick,
}) => {
  const [article, setArticle] = useState<BackendArticleDetail | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);

  const clusterId = +narrative.id;
  const weekNumber = parseWeekNumber(narrative.weekId);

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
        if (!cancelled) setArticle(detail);
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
      if (!cancelled) setArticle(detail);
    } catch {
      // optional: handle error
    } finally {
      if (!cancelled) setArticleLoading(false);
    }
  }

  load();
  return () => { cancelled = true; };
}, [clusterId, weekNumber, narrative.articleId]);

  // ── Claims fetch (parallel, independent) ───────────────────────────────────
  useEffect(() => {
  let cancelled = false;

  async function loadClaims() {
    if (!cancelled) setClaimsLoading(true);

    try {
      const res = await fetchNarrativeClaims(clusterId);
      if (!cancelled) {
        setClaims(adaptClaims(res, narrative.id));
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
            ? ` · Week ${article.week_number} · ${new Date(article.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}`
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
              marginBottom: '15px',
              paddingBottom: '5px',
            }}
          >
            Extracted Claims
          </h3>

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

          {claims.map(claim => {
            const youtubeHandle = claim.creatorName.startsWith('@')
              ? claim.creatorName
              : `@${claim.creatorName}`;

            return (
              <div key={claim.id} className="claim-card">
                <div className="claim-header">
                  <div className="profile-pic">{claim.creatorInitials}</div>

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
                    {claim.creatorName}
                  </a>

                  <span className={`risk-badge ${getRiskClass(claim.riskScore)}`}>
                    {claim.riskScore.toFixed(2)}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: 1.3 }}>
                  "{claim.extractedClaim}"
                </h4>

                {claim.originalQuote && (
                  <p
                    style={{
                      fontSize: '0.82rem',
                      fontStyle: 'italic',
                      color: 'var(--ink-faded)',
                      marginBottom: '10px',
                      textIndent: 0,
                    }}
                  >
                    {claim.originalQuote}
                  </p>
                )}

                {/* Link to video detail if we have a videoId, else YouTube fallback */}
                {claim.videoId ? (
                  <button
                    onClick={() => onVideoClick(claim.videoId!)}
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
                ) : claim.videoUrl !== '#' ? (
                  <a
                    href={claim.videoUrl}
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
