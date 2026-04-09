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
import { fetchWeeks, fetchNarrativesList, fetchTrendsList } from './services/api';
import { adaptWeeks, adaptNarrativesList, adaptTrendsList, generateTrendAlerts } from './lib/adapters';
import type { WeekData, Trend, TrendAlert, Narrative } from './types';

const WEEKS_CACHE_KEY = 'cap-weeks-v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

interface WeeksCache {
  weeks: WeekData[];
  savedAt: number; // Date.now() timestamp
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

  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Helper: get narratives for a week (from cache)
  const getNarrativesForWeek = (weekId: string): Narrative[] => narrativesByWeek[weekId] ?? [];

  // Fetch narratives for a week and cache them
  async function loadNarrativesForWeek(weekId: string): Promise<Narrative[]> {
    if (narrativesByWeek[weekId]) return narrativesByWeek[weekId];
    const res = await fetchNarrativesList(weekId);
    const narratives = adaptNarrativesList(res.narratives, weekId);
    setNarrativesByWeek(prev => ({ ...prev, [weekId]: narratives }));
    // Also update the week's narratives array
    setWeeks(prev => prev.map(w => w.id === weekId ? { ...w, narratives } : w));
    return narratives;
  }

  // Initial data load
  useEffect(() => {
    async function init() {
      const [weeksRes, trendsRes] = await Promise.all([
        isCacheFresh() ? Promise.resolve(null) : fetchWeeks(),
        fetchTrendsList(),
      ]);

      const adaptedWeeks = weeksRes ? adaptWeeks(weeksRes).reverse() : loadWeeksCache();
      const adaptedTrends = adaptTrendsList(trendsRes.trends);
      const alerts = generateTrendAlerts(trendsRes.trends);

      if (weeksRes) saveWeeksCache(adaptedWeeks);

      setWeeks(adaptedWeeks);
      setTrends(adaptedTrends);
      setTrendAlerts(alerts);

      // Load narratives for the current (first) week
      if (adaptedWeeks.length > 0) {
        const currentWeek = adaptedWeeks[0];
        const narrativesRes = await fetchNarrativesList(currentWeek.id);
        const narratives = adaptNarrativesList(narrativesRes.narratives, currentWeek.id);

        setNarrativesByWeek({ [currentWeek.id]: narratives });
        setWeeks(prev => prev.map(w => w.id === currentWeek.id ? { ...w, narratives } : w));

        // Initialize tabs now that we have data
        const firstTabId = `week-${currentWeek.id}`;
        setTabs([
          { id: firstTabId, type: 'week', weekId: currentWeek.id, baseLabel: 'Latest News', closable: false },
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
  }, []);

  const handleCloseTab = (tabId: string) => {
    const tabsToRemove = new Set([tabId, ...tabs.filter(t => t.parentId === tabId).map(t => t.id)]);
    const newTabs = tabs.filter(t => !tabsToRemove.has(t.id));

    if (tabsToRemove.has(activeTabId)) {
      const closingTab = tabs.find(t => t.id === activeTabId);
      if (closingTab?.parentId && newTabs.find(t => t.id === closingTab.parentId)) {
        setActiveTabId(closingTab.parentId);
      } else {
        setActiveTabId(newTabs[0]?.id || 'archives');
      }
    }

    setTabs(newTabs);
  };

  const handleOpenWeek = (weekId: string) => {
    const targetTabId = `week-${weekId}`;
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;

    if (!tabs.find(t => t.id === targetTabId)) {
      setTabs(prev => [...prev, { id: targetTabId, type: 'week', weekId, baseLabel: week.weekName, closable: true }]);
    }
    setActiveTabId(targetTabId);

    // Ensure narratives are loaded for this week
    loadNarrativesForWeek(weekId).catch(() => {});
  };

  const handleReadMore = (narrativeId: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab || activeTab.type !== 'week' || !activeTab.weekId) return;

    const weekNarratives = getNarrativesForWeek(activeTab.weekId);
    const narrative = weekNarratives.find(n => n.id === narrativeId);
    const label = narrative ? narrative.headline : 'Narrative Detail';
    const narrativeTabId = `narrative-${narrativeId}`;

    setTabs(prev => {
      if (!prev.find(t => t.id === narrativeTabId)) {
        return [...prev, {
          id: narrativeTabId,
          type: 'week',
          weekId: activeTab.weekId,
          narrativeId,
          baseLabel: label,
          closable: true,
          parentId: `week-${activeTab.weekId}`,
        }];
      }
      return prev;
    });
    setActiveTabId(narrativeTabId);
  };

  const handleVideoClick = (videoId: string | null) => {
    if (!videoId) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    const videoTabId = `video-${videoId}`;

    setTabs(prev => {
      if (!prev.find(t => t.id === videoTabId)) {
        return [...prev, {
          id: videoTabId,
          type: 'video',
          videoId: videoId,
          baseLabel: `Video Insight`,
          closable: true,
          parentId: activeTab ? activeTab.id : undefined
        }];
      }
      return prev;
    });
    setActiveTabId(videoTabId);
  };

  const handleTrendClick = (trendId: string) => {
    const trendTabId = `trend-${trendId}`;
    const trend = trends.find(t => t.id === trendId);
    const label = trend ? trend.name : 'Trend Detail';

    setTabs(prev => {
      if (!prev.find(t => t.id === trendTabId)) {
        return [...prev, {
          id: trendTabId,
          type: 'trends',
          trendId,
          baseLabel: label,
          closable: true,
          parentId: 'trends',
        }];
      }
      return prev;
    });
    setActiveTabId(trendTabId);
  };

  const handleNarrativeClickFromTrend = (narrativeId: string, weekId: string) => {
    const parentTabId = `week-${weekId}`;
    const narrativeTabId = `narrative-${narrativeId}`;

    const week = weeks.find(w => w.id === weekId);
    const weekNarratives = getNarrativesForWeek(weekId);
    const narrative = weekNarratives.find(n => n.id === narrativeId);
    const label = narrative?.headline || 'Narrative Detail';

    setTabs(prev => {
      const newTabs = [...prev];
      if (!newTabs.find(t => t.id === parentTabId)) {
        newTabs.push({ id: parentTabId, type: 'week', weekId, baseLabel: week?.weekName || 'Week', closable: true });
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

    // Ensure week narratives are loaded
    loadNarrativesForWeek(weekId).catch(() => {});
  };

  const handleBack = () => handleCloseTab(activeTabId);

  const tickerItems = trends.length > 0
    ? trends.map(t => `${t.name} | Heat: ${t.totalEngagement.toFixed(0)}`)
    : ['Loading intelligence feed...'];

  if (isLoading) {
    return (
      <div className="app-container">
        <Masthead tickerItems={['Connecting to intelligence feed...']} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p className="font-mono" style={{ color: 'var(--ink-faded)', fontSize: '1.1rem' }}>
            Loading weekly intelligence digest...
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
        if (trend) return <TrendDetail trend={trend} onBack={handleBack} onNarrativeClick={handleNarrativeClickFromTrend} />;
      }
      return <Trends trends={trends} trendAlerts={trendAlerts} onSelectTrend={handleTrendClick} />;
    }

    if (activeTab.type === 'claims') {
      return <Claims />;
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
          const narrative = weekWithNarratives.narratives.find(n => n.id === activeTab.narrativeId);
          if (narrative) {
            return <NarrativeDetail narrative={narrative} trends={trends} onBack={handleBack} onTrendClick={handleTrendClick} onVideoClick={handleVideoClick} />;
          }
        }
        return <WeekReport week={weekWithNarratives} trends={trends} onReadMore={handleReadMore} onTrendClick={handleTrendClick} />;
      }
    }

    return <div>Content not found</div>;
  };

  return (
    <div className="app-container">
      <Masthead tickerItems={tickerItems} />

      <FolderTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onCloseTab={handleCloseTab}
      />

      <main className="folder-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
