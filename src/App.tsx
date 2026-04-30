import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Masthead } from './components/layout/Masthead';
import { FolderTabs } from './components/layout/FolderTabs';
import { WeekReport } from './components/views/WeekReport';
import { NarrativeDetail } from './components/views/NarrativeDetail';
import { Trends } from './components/views/Trends';
import { TrendDetail } from './components/views/TrendDetail';
import { Archives } from './components/views/Archives';
import { Claims } from './components/views/Claims';
import { Videos } from './components/views/Videos';
import { VideoDetail } from './components/views/VideoDetail';
import {
  fetchWeeks,
  fetchWeekNarratives,
  fetchTrendsList,
  fetchTrendDetail,
  fetchArticles,
  type BackendArticleDetail,
  type BackendArticleListItem,
} from './services/api';
import {
  adaptWeeks,
  adaptWeekNarrativesList,
  buildWeekSummaryFromNarratives,
  adaptTrendsList,
  adaptTrendDetail,
  generateTrendAlerts,
  parseWeekNumber,
} from './lib/adapters';
import { getCurrentWeekId } from './lib/weekUtils';
import {
  reactNodeToText,
  searchDocuments,
  type SearchDocument,
  type SearchMatch,
} from './lib/search';
import type {
  Claim,
  Narrative,
  Trend,
  TrendAlert,
  Video,
  VideoDetailData,
  WeekData,
} from './types';

const WEEKS_CACHE_KEY = 'cap-weeks-v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ARTICLE_INDEX_LIMIT = 1000;

interface WeeksCache {
  weeks: WeekData[];
  savedAt: number;
}

interface CachedNarrativeArticle {
  weekId: string;
  narrativeId: string;
  article: BackendArticleDetail;
}

interface CachedNarrativeClaims {
  weekId: string;
  narrativeId: string;
  narrativeTitle: string;
  claims: Claim[];
}

function readWeeksCache(): WeeksCache | null {
  try {
    const raw = localStorage.getItem(WEEKS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeeksCache) : null;
  } catch {
    return null;
  }
}

function loadWeeksCache(): WeekData[] {
  return readWeeksCache()?.weeks ?? [];
}

function isCacheFresh(): boolean {
  const cache = readWeeksCache();
  return cache !== null && Date.now() - cache.savedAt < CACHE_TTL_MS;
}

function saveWeeksCache(weeks: WeekData[]): void {
  try {
    const payload: WeeksCache = {
      weeks: weeks.map(w => ({ ...w, narratives: [] })),
      savedAt: Date.now(),
    };
    localStorage.setItem(WEEKS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore when storage is unavailable.
  }
}

function getNarrativeCacheKey(weekId: string, narrativeId: string): string {
  return `${weekId}:${narrativeId}`;
}

function getNarrativeTabId(weekId: string, narrativeId: string): string {
  return `narrative-${weekId}-${narrativeId}`;
}

function mergeArticleListItems(
  existing: BackendArticleListItem[],
  incoming: BackendArticleListItem[],
): BackendArticleListItem[] {
  if (incoming.length === 0) return existing;

  const merged = new Map(existing.map(article => [article.article_id, article]));
  incoming.forEach(article => merged.set(article.article_id, article));

  return Array.from(merged.values()).sort((left, right) =>
    right.week_number - left.week_number || left.title.localeCompare(right.title),
  );
}

function findRootTabId(tabId: string | undefined, tabs: TabData[]): string | undefined {
  if (!tabId) return undefined;

  let current = tabs.find(tab => tab.id === tabId);
  while (current?.parentId) {
    current = tabs.find(tab => tab.id === current?.parentId);
  }

  return current?.id;
}

export interface TabData {
  id: string;
  type: 'week' | 'trends' | 'archives' | 'claims' | 'videos' | 'video';
  weekId?: string;
  narrativeId?: string | null;
  trendId?: string | null;
  videoId?: string | null;
  baseLabel: string;
  closable: boolean;
  parentId?: string;
}

function App() {
  const [weeks, setWeeks] = useState<WeekData[]>(loadWeeksCache);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendAlerts, setTrendAlerts] = useState<TrendAlert[]>([]);
  const [narrativesByWeek, setNarrativesByWeek] = useState<Record<string, Narrative[]>>({});
  const [articleIndex, setArticleIndex] = useState<BackendArticleListItem[]>([]);
  const [cachedNarrativeArticles, setCachedNarrativeArticles] = useState<
    Record<string, CachedNarrativeArticle>
  >({});
  const [cachedNarrativeClaims, setCachedNarrativeClaims] = useState<
    Record<string, CachedNarrativeClaims>
  >({});
  const [cachedVideos, setCachedVideos] = useState<Record<string, Video>>({});
  const [cachedVideoDetails, setCachedVideoDetails] = useState<
    Record<string, VideoDetailData>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const getNarrativesForWeek = (weekId: string): Narrative[] => narrativesByWeek[weekId] ?? [];

  async function loadNarrativesForWeek(
    weekId: string,
    prefetchedArticles?: BackendArticleListItem[],
  ): Promise<Narrative[]> {
    if (narrativesByWeek[weekId]) return narrativesByWeek[weekId];

    const weekNumber = parseWeekNumber(weekId);
    const indexedArticles =
      prefetchedArticles ??
      (weekNumber !== undefined
        ? articleIndex.filter(article => article.week_number === weekNumber)
        : []);

    const [narrativesRes, articlesRes] = await Promise.all([
      fetchWeekNarratives(weekId),
      weekNumber !== undefined
        ? indexedArticles.length > 0
          ? Promise.resolve({
              articles: indexedArticles,
              total: indexedArticles.length,
            })
          : fetchArticles({ week: weekNumber, limit: 200 })
        : Promise.resolve({ articles: [] as BackendArticleListItem[], total: 0 }),
    ]);

    const articlesByCluster = new Map<number, BackendArticleListItem>(
      articlesRes.articles.map(article => [article.cluster_id, article]),
    );

    const narratives = adaptWeekNarrativesList(
      narrativesRes.narratives,
      weekId,
      articlesByCluster,
    );

    setArticleIndex(prev => mergeArticleListItems(prev, articlesRes.articles));
    setNarrativesByWeek(prev => ({ ...prev, [weekId]: narratives }));
    setWeeks(prev =>
      prev.map(week => {
        if (week.id !== weekId) return week;
        const updatedSummary = buildWeekSummaryFromNarratives(narrativesRes.narratives, week.summary);
        return { ...week, narratives, summary: updatedSummary };
      }),
    );

    return narratives;
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    async function init() {
      const currentWeekId = getCurrentWeekId();
      const cachedWeeks = loadWeeksCache();
      const cacheHasCurrentWeek = cachedWeeks.some(week => week.id === currentWeekId);
      const shouldFetchWeeks = !isCacheFresh() || !cacheHasCurrentWeek;

      const [weeksRes, trendsRes, articlesRes] = await Promise.all([
        shouldFetchWeeks ? fetchWeeks() : Promise.resolve(null),
        fetchTrendsList(),
        fetchArticles({ limit: ARTICLE_INDEX_LIMIT }).catch(() => ({
          articles: [] as BackendArticleListItem[],
          total: 0,
        })),
      ]);

      const adaptedWeeks = weeksRes ? adaptWeeks(weeksRes).reverse() : loadWeeksCache();
      const adaptedTrends = adaptTrendsList(trendsRes.trends);
      const alerts = generateTrendAlerts(trendsRes.trends);

      if (weeksRes) saveWeeksCache(adaptedWeeks);

      setWeeks(adaptedWeeks);
      setTrends(adaptedTrends);
      setTrendAlerts(alerts);
      setArticleIndex(articlesRes.articles);

      trendsRes.trends.forEach(item => {
        fetchTrendDetail(item.cluster_id)
          .then(detail => {
            const enriched = adaptTrendDetail(detail);
            setTrends(prev =>
              prev.map(trend =>
                trend.id === enriched.id
                  ? {
                      ...trend,
                      engagementData: enriched.engagementData,
                      barChartData: enriched.barChartData,
                      detailedAnalysis: enriched.detailedAnalysis,
                      creatorRisks: enriched.creatorRisks,
                      weekHeadlines: enriched.weekHeadlines,
                    }
                  : trend,
              ),
            );
          })
          .catch(() => {
            // Leave placeholder sparkline data in place when enrichment fails.
          });
      });

      if (adaptedWeeks.length > 0) {
        const currentWeek =
          adaptedWeeks.find(week => week.id === currentWeekId) ?? adaptedWeeks[0];
        const currentWeekArticles = articlesRes.articles.filter(
          article => article.week_number === parseWeekNumber(currentWeek.id),
        );

        await loadNarrativesForWeek(currentWeek.id, currentWeekArticles);

        const firstTabId = `week-${currentWeek.id}`;
        setTabs([
          {
            id: firstTabId,
            type: 'week',
            weekId: currentWeek.id,
            baseLabel: 'Latest News',
            closable: false,
          },
          { id: 'claims', type: 'claims', baseLabel: 'The Classifieds', closable: false },
          { id: 'videos', type: 'videos', baseLabel: 'Video Feed', closable: false },
          { id: 'trends', type: 'trends', baseLabel: 'Trends Analytics', closable: false },
          { id: 'archives', type: 'archives', baseLabel: 'Archives', closable: false },
        ]);
        setActiveTabId(firstTabId);
      }

      setIsLoading(false);
    }

    init().catch(() => setIsLoading(false));
  }, [refreshKey]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleRefresh = () => {
    localStorage.removeItem(WEEKS_CACHE_KEY);
    setNarrativesByWeek({});
    setArticleIndex([]);
    setCachedNarrativeArticles({});
    setCachedNarrativeClaims({});
    setCachedVideos({});
    setCachedVideoDetails({});
    setTabs([]);
    setActiveTabId('');
    setSearchQuery('');
    setIsLoading(true);
    setRefreshKey(key => key + 1);
  };

  const handleCloseTab = (tabId: string) => {
    const tabsToRemove = new Set([
      tabId,
      ...tabs.filter(tab => tab.parentId === tabId).map(tab => tab.id),
    ]);
    const newTabs = tabs.filter(tab => !tabsToRemove.has(tab.id));

    if (tabsToRemove.has(activeTabId)) {
      const closingTab = tabs.find(tab => tab.id === activeTabId);
      if (closingTab?.parentId && newTabs.find(tab => tab.id === closingTab.parentId)) {
        setActiveTabId(closingTab.parentId);
      } else {
        setActiveTabId(newTabs[0]?.id ?? 'archives');
      }
    }

    setTabs(newTabs);
  };

  const handleOpenWeek = (weekId: string) => {
    const week = weeks.find(item => item.id === weekId);
    if (!week) return;

    const targetTabId = `week-${weekId}`;

    setTabs(prev => {
      if (prev.find(tab => tab.id === targetTabId)) return prev;

      const pinnedWeekId = prev.find(tab => tab.type === 'week' && !tab.closable)?.weekId;

      return [
        ...prev,
        {
          id: targetTabId,
          type: 'week',
          weekId,
          baseLabel: week.weekName,
          closable: weekId !== pinnedWeekId,
        },
      ];
    });

    setActiveTabId(targetTabId);
    loadNarrativesForWeek(weekId).catch(() => {});
  };

  const handleOpenNarrative = (weekId: string, narrativeId: string, label?: string) => {
    const week = weeks.find(item => item.id === weekId);
    if (!week) return;

    const parentTabId = `week-${weekId}`;
    const narrativeTabId = getNarrativeTabId(weekId, narrativeId);
    const cachedNarrative = getNarrativesForWeek(weekId).find(
      narrative => narrative.id === narrativeId,
    );
    const baseLabel = label ?? cachedNarrative?.headline ?? 'Narrative Detail';

    setTabs(prev => {
      const nextTabs = [...prev];
      const pinnedWeekId = prev.find(tab => tab.type === 'week' && !tab.closable)?.weekId;

      if (!nextTabs.find(tab => tab.id === parentTabId)) {
        nextTabs.push({
          id: parentTabId,
          type: 'week',
          weekId,
          baseLabel: week.weekName,
          closable: weekId !== pinnedWeekId,
        });
      }

      if (!nextTabs.find(tab => tab.id === narrativeTabId)) {
        nextTabs.push({
          id: narrativeTabId,
          type: 'week',
          weekId,
          narrativeId,
          baseLabel,
          closable: true,
          parentId: parentTabId,
        });
      }

      return nextTabs;
    });

    setActiveTabId(narrativeTabId);

    loadNarrativesForWeek(weekId)
      .then(narratives => {
        const narrative = narratives.find(item => item.id === narrativeId);
        if (!narrative) return;

        setTabs(prev =>
          prev.map(tab =>
            tab.id === narrativeTabId ? { ...tab, baseLabel: narrative.headline } : tab,
          ),
        );
      })
      .catch(() => {});
  };

  const handleReadMore = (narrativeId: string) => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab?.weekId) return;

    const narrative = getNarrativesForWeek(activeTab.weekId).find(item => item.id === narrativeId);
    handleOpenNarrative(activeTab.weekId, narrativeId, narrative?.headline);
  };

  const handleTrendClick = (trendId: string) => {
    const trendTabId = `trend-${trendId}`;
    const trend = trends.find(item => item.id === trendId);
    const label = trend?.name ?? 'Trend Detail';

    setTabs(prev => {
      if (prev.find(tab => tab.id === trendTabId)) return prev;

      return [
        ...prev,
        {
          id: trendTabId,
          type: 'trends',
          trendId,
          baseLabel: label,
          closable: true,
          parentId: 'trends',
        },
      ];
    });

    setActiveTabId(trendTabId);
  };

  const handleNarrativeClickFromTrend = (narrativeId: string, weekId: string) => {
    const narrative = getNarrativesForWeek(weekId).find(item => item.id === narrativeId);
    handleOpenNarrative(weekId, narrativeId, narrative?.headline);
  };

  const handleVideoClick = (videoId: string | null, parentTabId?: string) => {
    if (!videoId) return;

    const videoTabId = `video-${videoId}`;
    const rootedParentId =
      findRootTabId(parentTabId ?? activeTabId, tabs) ??
      tabs.find(tab => tab.type === 'videos')?.id ??
      tabs.find(tab => !tab.parentId)?.id;

    setTabs(prev => {
      if (prev.find(tab => tab.id === videoTabId)) return prev;

      return [
        ...prev,
        {
          id: videoTabId,
          type: 'video',
          videoId,
          baseLabel: 'Video Insight',
          closable: true,
          parentId: rootedParentId,
        },
      ];
    });

    setActiveTabId(videoTabId);
  };

  const handleBack = () => handleCloseTab(activeTabId);

  const handleArticleCached = (
    weekId: string,
    narrativeId: string,
    article: BackendArticleDetail,
  ) => {
    const cacheKey = getNarrativeCacheKey(weekId, narrativeId);

    setCachedNarrativeArticles(prev => ({
      ...prev,
      [cacheKey]: { weekId, narrativeId, article },
    }));

    setArticleIndex(prev =>
      mergeArticleListItems(prev, [
        {
          article_id: article.article_id,
          cluster_id: article.cluster_id,
          week_number: article.week_number,
          week_start_date: article.week_start_date,
          title: article.title,
          overview: article.overview,
          created_at: article.created_at,
        },
      ]),
    );
  };

  const handleClaimsCached = (
    weekId: string,
    narrativeId: string,
    narrativeTitle: string,
    claims: Claim[],
  ) => {
    const cacheKey = getNarrativeCacheKey(weekId, narrativeId);

    setCachedNarrativeClaims(prev => ({
      ...prev,
      [cacheKey]: {
        weekId,
        narrativeId,
        narrativeTitle,
        claims,
      },
    }));
  };

  const handleClaimsBatchCached = (
    entries: Array<{
      weekId: string;
      narrativeId: string;
      narrativeTitle: string;
      claims: Claim[];
    }>,
  ) => {
    if (entries.length === 0) return;

    setCachedNarrativeClaims(prev => {
      const next = { ...prev };
      entries.forEach(entry => {
        next[getNarrativeCacheKey(entry.weekId, entry.narrativeId)] = entry;
      });
      return next;
    });
  };

  const handleVideosCached = (videos: Video[]) => {
    if (videos.length === 0) return;

    setCachedVideos(prev => {
      const next = { ...prev };
      videos.forEach(video => {
        next[video.id] = video;
      });
      return next;
    });
  };

  const handleVideoCached = (video: VideoDetailData) => {
    setCachedVideoDetails(prev => ({ ...prev, [video.id]: video }));
    setCachedVideos(prev => ({ ...prev, [video.id]: video }));
  };

  const searchIndex = useMemo(() => {
    const documents: SearchDocument[] = [];
    const weekMap = new Map(weeks.map(week => [week.id, week]));
    const trendMap = new Map(trends.map(trend => [trend.id, trend]));
    const articleByNarrative = new Map(
      articleIndex.map(article => [
        getNarrativeCacheKey(`week${article.week_number}`, article.cluster_id.toString()),
        article,
      ]),
    );
    const loadedNarrativeKeys = new Set<string>();

    weeks.forEach(week => {
      const cachedNarratives = narrativesByWeek[week.id] ?? [];

      documents.push({
        id: `week:${week.id}`,
        kind: 'week',
        title: week.weekName,
        subtitle: week.dateRange,
        body: [
          week.summary.headline,
          reactNodeToText(week.summary.content),
          cachedNarratives.map(narrative => narrative.headline).join(' | '),
        ]
          .filter(Boolean)
          .join(' '),
        keywords: cachedNarratives.map(narrative => narrative.headline),
        target: { type: 'week', weekId: week.id },
      });
    });

    Object.entries(narrativesByWeek).forEach(([weekId, narratives]) => {
      const week = weekMap.get(weekId);

      narratives.forEach(narrative => {
        const cacheKey = getNarrativeCacheKey(weekId, narrative.id);
        const indexedArticle = articleByNarrative.get(cacheKey);
        const detailedArticle = cachedNarrativeArticles[cacheKey]?.article;
        const trendNames = narrative.trendIds
          .map(trendId => trendMap.get(trendId)?.name)
          .filter(Boolean) as string[];

        loadedNarrativeKeys.add(cacheKey);

        documents.push({
          id: `narrative:${cacheKey}`,
          kind: 'narrative',
          title: detailedArticle?.title ?? indexedArticle?.title ?? narrative.headline,
          subtitle: [week?.weekName ?? weekId, reactNodeToText(narrative.subheadline)]
            .filter(Boolean)
            .join(' · '),
          body: [
            reactNodeToText(narrative.summary),
            narrative.overview,
            reactNodeToText(narrative.fullText),
            indexedArticle?.overview,
            detailedArticle?.overview,
            detailedArticle?.body,
          ]
            .filter(Boolean)
            .join(' '),
          keywords: [
            narrative.category,
            ...trendNames,
            week?.dateRange ?? '',
            reactNodeToText(narrative.subheadline),
          ].filter(Boolean),
          target: { type: 'narrative', weekId, narrativeId: narrative.id },
        });
      });
    });

    articleIndex.forEach(article => {
      const weekId = `week${article.week_number}`;
      const cacheKey = getNarrativeCacheKey(weekId, article.cluster_id.toString());
      if (loadedNarrativeKeys.has(cacheKey)) return;

      const week = weekMap.get(weekId);
      if (!week) return;

      documents.push({
        id: `article:${cacheKey}`,
        kind: 'narrative',
        title: article.title,
        subtitle: [week.weekName, week.dateRange].filter(Boolean).join(' · '),
        body: article.overview,
        keywords: [week.weekName, week.dateRange].filter(Boolean),
        target: {
          type: 'narrative',
          weekId,
          narrativeId: article.cluster_id.toString(),
        },
      });
    });

    trends.forEach(trend => {
      documents.push({
        id: `trend:${trend.id}`,
        kind: 'trend',
        title: trend.name,
        subtitle: 'Trends Analytics',
        body: [
          reactNodeToText(trend.description),
          trend.overallSentiment,
          trend.recentSentiment,
          reactNodeToText(trend.detailedAnalysis),
          Object.values(trend.weekHeadlines).join(' '),
          trend.creatorRisks.map(risk => `${risk.channelId} ${risk.riskLevel}`).join(' '),
        ]
          .filter(Boolean)
          .join(' '),
        keywords: [trend.overallSentiment, trend.recentSentiment],
        target: { type: 'trend', trendId: trend.id },
      });
    });

    const videoIds = new Set([
      ...Object.keys(cachedVideos),
      ...Object.keys(cachedVideoDetails),
    ]);

    videoIds.forEach(videoId => {
      const summary = cachedVideos[videoId];
      const detail = cachedVideoDetails[videoId];
      const video = detail ?? summary;
      if (!video) return;

      documents.push({
        id: `video:${videoId}`,
        kind: 'video',
        title: video.title,
        subtitle: [video.channel, video.clusterLabel].filter(Boolean).join(' · '),
        body: [
          detail?.description,
          detail?.transcript,
          detail?.keyClaims.join(' '),
          detail?.topics.join(' '),
          detail?.topComments.map(comment => comment.text).join(' '),
        ]
          .filter(Boolean)
          .join(' '),
        keywords: [
          video.channel,
          video.clusterLabel,
          ...(detail?.topics ?? []),
          ...(detail?.keyClaims ?? []),
        ].filter(Boolean),
        target: { type: 'video', videoId },
      });
    });

    Object.values(cachedNarrativeClaims).forEach(entry => {
      const week = weekMap.get(entry.weekId);

      entry.claims.forEach((claim, index) => {
        documents.push({
          id: `claim:${entry.weekId}:${entry.narrativeId}:${claim.id}:${index}`,
          kind: 'claim',
          title: reactNodeToText(claim.extractedClaim),
          subtitle: [entry.narrativeTitle, week?.weekName ?? entry.weekId, claim.creatorName]
            .filter(Boolean)
            .join(' · '),
          body: [claim.originalQuote, entry.narrativeTitle, claim.creatorName]
            .filter(Boolean)
            .join(' '),
          keywords: [claim.claimType, claim.creatorName],
          target: claim.videoId
            ? { type: 'video', videoId: claim.videoId }
            : {
                type: 'narrative',
                weekId: entry.weekId,
                narrativeId: entry.narrativeId,
              },
        });
      });
    });

    return documents;
  }, [
    articleIndex,
    cachedNarrativeArticles,
    cachedNarrativeClaims,
    cachedVideoDetails,
    cachedVideos,
    narrativesByWeek,
    trends,
    weeks,
  ]);

  const searchResults = useMemo(
    () => searchDocuments(searchIndex, deferredSearchQuery),
    [deferredSearchQuery, searchIndex],
  );

  const handleSearchSelect = (result: SearchMatch) => {
    setSearchQuery('');

    switch (result.target.type) {
      case 'week':
        handleOpenWeek(result.target.weekId);
        return;
      case 'narrative':
        handleOpenNarrative(
          result.target.weekId,
          result.target.narrativeId,
          result.title,
        );
        return;
      case 'trend':
        handleTrendClick(result.target.trendId);
        return;
      case 'video':
        handleVideoClick(result.target.videoId, tabs.find(tab => tab.type === 'videos')?.id);
        return;
    }
  };

  const tickerItems =
    trends.length > 0
      ? trends.filter(t => t.totalEngagement > 0).map(trend => `${trend.name} | Heat: ${trend.totalEngagement.toFixed(0)}`)
      : ['Loading intelligence feed...'];

  if (isLoading) {
    return (
      <div className="app-container">
        <Masthead tickerItems={['Connecting to intelligence feed...']} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
          }}
        >
          <p className="font-mono" style={{ color: 'var(--ink-faded)', fontSize: '1.1rem' }}>
            Loading weekly intelligence digest...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return null;

    if (activeTab.type === 'video' && activeTab.videoId) {
      return (
        <VideoDetail
          videoId={activeTab.videoId}
          onBack={handleBack}
          onVideoCached={handleVideoCached}
        />
      );
    }

    if (activeTab.type === 'videos') {
      return (
        <Videos
          onVideoClick={handleVideoClick}
          onVideosCached={handleVideosCached}
          initialVideos={Object.values(cachedVideos)}
        />
      );
    }

    if (activeTab.type === 'trends') {
      if (activeTab.trendId) {
        const trend = trends.find(item => item.id === activeTab.trendId);
        if (trend) {
          return (
            <TrendDetail
              trend={trend}
              onBack={handleBack}
              onNarrativeClick={handleNarrativeClickFromTrend}
            />
          );
        }
      }

      return (
        <Trends
          trends={trends}
          trendAlerts={trendAlerts}
          onSelectTrend={handleTrendClick}
        />
      );
    }

    if (activeTab.type === 'claims') {
      const currentWeekId =
        tabs.find(tab => tab.type === 'week' && !tab.closable)?.weekId ??
        weeks[0]?.id ??
        '';

      return (
        <Claims
          currentWeekId={currentWeekId}
          weeks={weeks}
          onClaimsCached={handleClaimsBatchCached}
        />
      );
    }

    if (activeTab.type === 'archives') {
      return <Archives weeks={weeks} onOpenWeek={handleOpenWeek} />;
    }

    if (activeTab.type === 'week' && activeTab.weekId) {
      const week = weeks.find(item => item.id === activeTab.weekId);
      if (!week) return <div>Content not found</div>;

      const weekNarratives = getNarrativesForWeek(week.id);
      const weekWithNarratives = {
        ...week,
        narratives: weekNarratives,
      };

      if (activeTab.narrativeId) {
        const narrative = weekNarratives.find(item => item.id === activeTab.narrativeId);

        if (narrative) {
          return (
            <NarrativeDetail
              narrative={narrative}
              trends={trends}
              onBack={handleBack}
              onTrendClick={handleTrendClick}
              onVideoClick={handleVideoClick}
              onArticleCached={handleArticleCached}
              onClaimsCached={handleClaimsCached}
            />
          );
        }

        if (!narrativesByWeek[week.id]) {
          return (
            <section className="view-section">
              <button className="btn-back" onClick={handleBack}>
                &larr; Back to Report
              </button>
              <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>
                Loading narrative archive...
              </p>
            </section>
          );
        }
      }

      return (
        <WeekReport
          week={weekWithNarratives}
          trends={trends}
          onReadMore={handleReadMore}
          onTrendClick={handleTrendClick}
        />
      );
    }

    return <div>Content not found</div>;
  };

  return (
    <div className="app-container">
      <Masthead
        tickerItems={tickerItems}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearchQueryChange={setSearchQuery}
        onSearchSelect={handleSearchSelect}
      />
      <FolderTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onCloseTab={handleCloseTab}
      />
      <main className="folder-content">{renderContent()}</main>
    </div>
  );
}

export default App;
