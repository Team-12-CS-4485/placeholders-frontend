import React from 'react';
import type { WeekData, Trend } from '../../types';
import { formatViews, formatCount } from '../../lib/weekUtils';

interface WeekReportProps {
  week: WeekData;
  trends: Trend[];
  onReadMore: (id: string) => void;
  onTrendClick: (trendId: string) => void;
}

export const WeekReport: React.FC<WeekReportProps> = ({ week, trends, onReadMore, onTrendClick }) => {
  const hasHeatData = week.narratives.some(n => (n.viewCount ?? 0) > 0);
  const orderedNarratives = hasHeatData
    ? [...week.narratives].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    : week.narratives;

  const trendsById = new Map(trends.map(t => [t.id, t]));

  // Determine classifieds threshold based on engagement
  const maxViews = orderedNarratives[0]?.viewCount ?? 0;
  const classifiedThreshold = maxViews > 0 ? maxViews * 0.15 : 0;

  // Classify low-engagement narratives (excluding hero)
  const classifiedIds = new Set(
    orderedNarratives
      .slice(1) // Skip hero
      .filter(n => n.viewCount !== undefined && classifiedThreshold > 0 && n.viewCount < classifiedThreshold)
      .map(n => n.id)
  );

  // Group narratives by their first (primary) trend ID
  const narrativesByTrend = orderedNarratives.reduce(
    (acc, narrative) => {
      const primaryTrendId = narrative.trendIds[0];
      if (!acc[primaryTrendId]) acc[primaryTrendId] = [];
      acc[primaryTrendId].push(narrative);
      return acc;
    },
    {} as Record<string, typeof orderedNarratives>
  );

  // Get unique trend IDs from main-grid narratives (with deduplication in order)
  const mainGridNarratives = orderedNarratives.filter(n => !classifiedIds.has(n.id));
  const trendOrder = [...new Map(mainGridNarratives.map(n => [n.trendIds[0], true])).keys()];

  // TODO: find an endpoint or usecase for this, until then this is unused
  // const alertNarrative = orderedNarratives.find(n => n.isBreaking) ?? null;
  const classifiedItems = orderedNarratives.filter(n => classifiedIds.has(n.id));

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>{week.weekName}</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>{week.dateRange}</p>
      </div>

      {/* Weekly Summary */}
      <div style={{ paddingBottom: '20px', marginBottom: '0' }}>
        <span className="font-mono" style={{ color: 'var(--ink-faded)', textTransform: 'uppercase' }}>Week summary</span>
        <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>{week.summary.headline}</p>
        {/* Structured stats row — populated after narratives load */}
        {(week.summary.totalNarratives !== undefined ||
          week.summary.breakingCount !== undefined ||
          week.summary.dominantSentiment) && (
          <div className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)', marginTop: '6px' }}>
            {week.totalViews > 0 && (
              <>{formatCount(week.totalViews)} views</>
            )}
            {week.summary.totalNarratives !== undefined && (
              <>&nbsp;·&nbsp;{week.summary.totalNarratives} narratives</>
            )}
            {week.summary.breakingCount !== undefined && week.summary.breakingCount > 0 && (
              <>&nbsp;·&nbsp;{week.summary.breakingCount} breaking</>
            )}
            {week.summary.dominantSentiment && (
              <>&nbsp;·&nbsp;{week.summary.dominantSentiment.charAt(0).toUpperCase() +
                week.summary.dominantSentiment.slice(1).toLowerCase()} sentiment</>
            )}
          </div>
        )}
      </div>

      {/* Newspaper Grid of Narratives, grouped by trend */}
      <div className="newspaper-grid">
        {trendOrder.map(trendId => {
          const trend = trendsById.get(trendId);
          const narrativesForTrend = narrativesByTrend[trendId].filter(
            n => !classifiedIds.has(n.id)
          );

          // Skip trend if all its narratives are classified
          if (narrativesForTrend.length === 0) return null;

          return (
            <React.Fragment key={`trend-${trendId}`}>
              {/* Trend divider spanning full width */}
              <div style={{ gridColumn: '1 / -1', display: 'contents' }}>
                <div className="rule-section" style={{ gridColumn: '1 / -1' }}>
                  <hr />
                  <span className="rule-label">— {trend?.name ?? 'Editorial'} —</span>
                  <hr />
                </div>
              </div>

              {/* Narratives for this trend */}
              {narrativesForTrend.map(narrative => {
                const isHero = narrative === orderedNarratives[0];

                return (
                  <div key={narrative.id} className="col-span-12 article-block">
                    <div className="byline">
                      {narrative.viewCount !== undefined && formatViews(narrative.viewCount)}
                      {narrative.claimCount !== undefined && <>&nbsp;·&nbsp;{narrative.claimCount} {narrative.claimCount === 1 ? 'claim' : 'claims'}</>}
                      {narrative.isBreaking && <>&nbsp;·&nbsp;<span className="hl-yellow">Breaking</span></>}
                    </div>

                    <h2
                      className="clickable-title"
                      style={{ fontSize: isHero ? '2.2rem' : '1.6rem', marginBottom: '5px' }}
                      onClick={() => onReadMore(narrative.id)}
                    >
                      {narrative.headline}
                    </h2>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '0', paddingLeft: '5px' }}>
                      {narrative.trendIds.map(tId => {
                        const trendChip = trendsById.get(tId);
                        return trendChip ? (
                          <span key={tId} className="trend-chip" onClick={() => onTrendClick(tId)}>
                            <span className="trend-chip-text">{trendChip.name}</span>
                          </span>
                        ) : null;
                      })}
                    </div>

                    {narrative.trendIds.filter(tId => trendsById.has(tId)).length === 0 && (
                      <p className="lead" style={{ marginBottom: '15px' }}>{narrative.subheadline}</p>
                    )}

                    <div className="article-grid">
                      <div className="drop-cap-block"><p style={{ marginTop: '8px' }}>{narrative.summary}</p></div>
                      {narrative.fullText.some(t => typeof t === 'string') && (
                        <div className="fact-card">
                          <div className="fact-card-side">Context</div>
                          <div className="fact-card-body">
                            {narrative.fullText.filter((t): t is string => typeof t === 'string').map((claim, i) => (
                              <p key={i} className="fact-card-text" style={i > 0 ? { marginTop: '8px' } : undefined}>{claim}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn-link"
                      onClick={() => onReadMore(narrative.id)}
                    >
                      Continued on page {narrative.pageNumber} &rarr;
                    </button>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>

      {/* TODO: find an endpoint or usecase for this, until then this is unused */}
      {/* {alertNarrative && (
        <div className="alert-box">
          <div className="stamp">Editor's Alert</div>
          <p>
            {alertNarrative.overview ?? `Breaking: ${alertNarrative.headline}`}
          </p>
        </div>
      )} */}

      {/* Classifieds Grid */}
      {classifiedItems.length > 0 && (
        <>
          <div className="rule-section" style={{ marginTop: '30px' }}>
            <hr />
            <span className="rule-label">— Classified Notices —</span>
            <hr />
          </div>
          <div className="classifieds-grid">
            {classifiedItems.map(narrative => {
              const chipTrend = narrative.trendIds.map((id: string) => trendsById.get(id)).find(Boolean);
              return (
                <div key={narrative.id} className="classified-item">
                  <span className="classified-meta">
                    {chipTrend?.name ?? 'General'}
                  </span>
                  <div className="classified-title">
                    <span
                      className="clickable-title"
                      onClick={() => onReadMore(narrative.id)}
                    >
                      {narrative.headline}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>{narrative.summary}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
