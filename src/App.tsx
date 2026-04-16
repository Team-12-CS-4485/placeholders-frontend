import { useState, useEffect } from 'react';
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
} from './services/api';
import {
  adaptWeeks,
  adaptWeekNarrativesList,
  adaptTrendsList,
  adaptTrendDetail,
  generateTrendAlerts,
  parseWeekNumber,
} from './lib/adapters';
import { getCurrentWeekId } from './lib/weekUtils';
import type { WeekData, Trend, TrendAlert, Narrative } from './types';
import type { BackendArticleListItem } from './services/api';

const WEEKS_CACHE_KEY = 'cap-weeks-v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface WeeksCache {
  weeks: WeekData[];
  savedAt: number;
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
    // Ignore — storage unavailable in private browsing
  }
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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  const getNarrativesForWeek = (weekId: string): Narrative[] =>
    narrativesByWeek[weekId] ?? [];

  async function loadNarrativesForWeek(weekId: string): Promise<Narrative[]> {
    if (narrativesByWeek[weekId]) return narrativesByWeek[weekId];

    const weekNumber = parseWeekNumber(weekId);

    const [narrativesRes, articlesRes] = await Promise.all([
      fetchWeekNarratives(weekId),
      weekNumber !== undefined
        ? fetchArticles({ week: weekNumber, limit: 200 })
        : Promise.resolve({ articles: [] as BackendArticleListItem[], total: 0 }),
    ]);

    const articlesByCluster = new Map<number, BackendArticleListItem>(
      articlesRes.articles.map((a: BackendArticleListItem) => [a.cluster_id, a]),
    );

    const narratives = adaptWeekNarrativesList(
      narrativesRes.narratives,
      weekId,
      articlesByCluster,
    );

    setNarrativesByWeek(prev => ({ ...prev, [weekId]: narratives }));
    setWeeks(prev =>
      prev.map(w => (w.id === weekId ? { ...w, narratives } : w)),
    );
    return narratives;
  }

  useEffect(() => {
    async function init() {
      const currentWeekId = getCurrentWeekId();
      const cachedWeeks = loadWeeksCache();
      const cacheHasCurrentWeek = cachedWeeks.some(w => w.id === currentWeekId);
      const shouldFetchWeeks = !isCacheFresh() || !cacheHasCurrentWeek;

      const [weeksRes, trendsRes] = await Promise.all([
        shouldFetchWeeks ? fetchWeeks() : Promise.resolve(null),
        fetchTrendsList(),
      ]);

      const adaptedWeeks = weeksRes
        ? adaptWeeks(weeksRes).reverse()
        : loadWeeksCache();
      const adaptedTrends = adaptTrendsList(trendsRes.trends);
      const alerts = generateTrendAlerts(trendsRes.trends);

      if (weeksRes) saveWeeksCache(adaptedWeeks);

      setWeeks(adaptedWeeks);
      setTrends(adaptedTrends);
      setTrendAlerts(alerts);

      // ── Backfill real week_data for every trend sparkline ─────────────────
      // The list endpoint has no week_data, so sparklines start as a flat
      // placeholder. We fire fetchTrendDetail() for each trend in parallel
      // and merge real view_count per-week data into state as each resolves.
      trendsRes.trends.forEach(item => {
        fetchTrendDetail(item.cluster_id)
          .then(detail => {
            const enriched = adaptTrendDetail(detail);
            setTrends(prev =>
              prev.map(t =>
                t.id === enriched.id
                  ? {
                      ...t,
                      engagementData: enriched.engagementData,
                      barChartData: enriched.barChartData,
                      detailedAnalysis: enriched.detailedAnalysis,
                      creatorRisks: enriched.creatorRisks,
                      weekHeadlines: enriched.weekHeadlines,
                    }
                  : t,
              ),
            );
          })
          .catch(() => {
            // Non-fatal: sparkline keeps placeholder until next refresh
          });
      });
      // ─────────────────────────────────────────────────────────────────────

      if (adaptedWeeks.length > 0) {
        const currentWeek =
          adaptedWeeks.find(w => w.id === currentWeekId) ?? adaptedWeeks[0];
        const narratives = await loadNarrativesForWeek(currentWeek.id);

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

        void narratives;
      }

      setIsLoading(false);
    }

    init().catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleRefresh = () => {
    localStorage.removeItem(WEEKS_CACHE_KEY);
    setNarrativesByWeek({});
    setIsLoading(true);
    setRefreshKey(k => k + 1);
  };

  const handleCloseTab = (tabId: string) => {
    const tabsToRemove = new Set([
      tabId,
      ...tabs.filter(t => t.parentId === tabId).map(t => t.id),
    ]);
    const newTabs = tabs.filter(t => !tabsToRemove.has(t.id));

    if (tabsToRemove.has(activeTabId)) {
      const closingTab = tabs.find(t => t.id === activeTabId);
      if (closingTab?.parentId && newTabs.find(t => t.id === closingTab.parentId)) {
        setActiveTabId(closingTab.parentId);
      } else {
        setActiveTabId(newTabs[0]?.id ?? 'archives');
      }
    }
    setTabs(newTabs);
  };

  const handleOpenWeek = (weekId: string) => {
    const targetTabId = `week-${weekId}`;
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    if (!tabs.find(t => t.id === targetTabId)) {
      setTabs(prev => [
        ...prev,
        { id: targetTabId, type: 'week', weekId, baseLabel: week.weekName, closable: true },
      ]);
    }
    setActiveTabId(targetTabId);
    loadNarrativesForWeek(weekId).catch(() => {});
  };

  const handleReadMore = (narrativeId: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || activeTab.type !== 'week' || !activeTab.weekId) return;

    const weekNarratives = getNarrativesForWeek(activeTab.weekId);
    const narrative = weekNarratives.find(n => n.id === narrativeId);
    const label = narrative?.headline ?? 'Narrative Detail';
    const narrativeTabId = `narrative-${narrativeId}`;

    setTabs(prev => {
      if (prev.find(t => t.id === narrativeTabId)) return prev;
      return [
        ...prev,
        {
          id: narrativeTabId,
          type: 'week',
          weekId: activeTab.weekId,
          narrativeId,
          baseLabel: label,
          closable: true,
          parentId: `week-${activeTab.weekId}`,
        },
      ];
    });
    setActiveTabId(narrativeTabId);
  };

  const handleVideoClick = (videoId: string | null) => {
    if (!videoId) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    const videoTabId = `video-${videoId}`;

    setTabs(prev => {
      if (prev.find(t => t.id === videoTabId)) return prev;
      return [
        ...prev,
        {
          id: videoTabId,
          type: 'video',
          videoId,
          baseLabel: 'Video Insight',
          closable: true,
          parentId: activeTab ? activeTab.id : undefined,
        },
      ];
    });
    setActiveTabId(videoTabId);
  };

  const handleTrendClick = (trendId: string) => {
    const trendTabId = `trend-${trendId}`;
    const trend = trends.find(t => t.id === trendId);
    const label = trend?.name ?? 'Trend Detail';

    setTabs(prev => {
      if (prev.find(t => t.id === trendTabId)) return prev;
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
    const parentTabId = `week-${weekId}`;
    const narrativeTabId = `narrative-${narrativeId}`;
    const week = weeks.find(w => w.id === weekId);
    const weekNarratives = getNarrativesForWeek(weekId);
    const narrative = weekNarratives.find(n => n.id === narrativeId);
    const label = narrative?.headline ?? 'Narrative Detail';

    setTabs(prev => {
      const newTabs = [...prev];
      if (!newTabs.find(t => t.id === parentTabId)) {
        newTabs.push({
          id: parentTabId,
          type: 'week',
          weekId,
          baseLabel: week?.weekName ?? 'Week',
          closable: true,
        });
      }
      if (!newTabs.find(t => t.id === narrativeTabId)) {
        newTabs.push({
          id: narrativeTabId,
          type: 'week',
          weekId,
          narrativeId,
          baseLabel: label,
          closable: true,
          parentId: parentTabId,
        });
      }
      return newTabs;
    });
    setActiveTabId(narrativeTabId);
    loadNarrativesForWeek(weekId).catch(() => {});
  };

  const handleBack = () => handleCloseTab(activeTabId);

  const tickerItems =
    trends.length > 0
      ? trends.map(t => `${t.name} | Heat: ${t.totalEngagement.toFixed(0)}`)
      : ['Loading intelligence feed…'];

  if (isLoading) {
    return (
      <div className="app-container">
        <Masthead tickerItems={['Connecting to intelligence feed…']} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
          }}
        >
          <p className="font-mono" style={{ color: 'var(--ink-faded)', fontSize: '1.1rem' }}>
            Loading weekly intelligence digest…
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return null;

    if (activeTab.type === 'video' && activeTab.videoId) {
      return <VideoDetail videoId={activeTab.videoId} onBack={handleBack} />;
    }

    if (activeTab.type === 'videos') {
      return <Videos onVideoClick={handleVideoClick} />;
    }

    if (activeTab.type === 'trends') {
      if (activeTab.trendId) {
        const trend = trends.find(t => t.id === activeTab.trendId);
        if (trend)
          return (
            <TrendDetail
              trend={trend}
              onBack={handleBack}
              onNarrativeClick={handleNarrativeClickFromTrend}
            />
          );
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
      const currentWeekId = tabs.find(t => t.type === 'week' && !t.closable)?.weekId ?? weeks[0]?.id ?? '';
      return <Claims currentWeekId={currentWeekId} weeks={weeks} />;
    }

    if (activeTab.type === 'archives') {
      return <Archives weeks={weeks} onOpenWeek={handleOpenWeek} />;
    }

    if (activeTab.type === 'week' && activeTab.weekId) {
      const week = weeks.find(w => w.id === activeTab.weekId);
      if (week) {
        const weekWithNarratives = {
          ...week,
          narratives: getNarrativesForWeek(week.id),
        };

        if (activeTab.narrativeId) {
          const narrative = weekWithNarratives.narratives.find(
            n => n.id === activeTab.narrativeId,
          );
          if (narrative) {
            return (
              <NarrativeDetail
                narrative={narrative}
                trends={trends}
                onBack={handleBack}
                onTrendClick={handleTrendClick}
                onVideoClick={handleVideoClick}
              />
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
    }

    return <div>Content not found</div>;
  };

  return (
    <div className="app-container">
      <Masthead tickerItems={tickerItems} onRefresh={handleRefresh} />
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
