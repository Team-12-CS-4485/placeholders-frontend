import { useState } from 'react';
import { Masthead } from './components/layout/Masthead';
import { FolderTabs } from './components/layout/FolderTabs';
import { WeekReport } from './components/views/WeekReport';
import { NarrativeDetail } from './components/views/NarrativeDetail';
import { Trends } from './components/views/Trends';
import { TrendDetail } from './components/views/TrendDetail';
import { Archives } from './components/views/Archives';
import { Claims } from './components/views/Claims';
import { mockWeeks, mockTrends } from './data/mockData';

export interface TabData {
  id: string;
  type: 'week' | 'trends' | 'archives' | 'claims';
  weekId?: string;
  narrativeId?: string | null;
  trendId?: string | null;
  baseLabel: string;
  closable: boolean;
  parentId?: string; // Links dynamic tabs to their static/parent group
}

function App() {
  // Initialize with the Current Week, Classifieds, Trends, and Archives
  const [tabs, setTabs] = useState<TabData[]>([
    { id: `week-${mockWeeks[0].id}`, type: 'week', weekId: mockWeeks[0].id, baseLabel: `${mockWeeks[0].weekName} (Current)`, closable: false },
    { id: 'claims', type: 'claims', baseLabel: 'The Classifieds', closable: false },
    { id: 'trends', type: 'trends', baseLabel: 'Trends Analytics', closable: false },
    { id: 'archives', type: 'archives', baseLabel: 'Archives', closable: false },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>(`week-${mockWeeks[0].id}`);

  const handleCloseTab = (tabId: string) => {
    // If a parent tab closes, close its children too
    const tabsToRemove = new Set([tabId, ...tabs.filter(t => t.parentId === tabId).map(t => t.id)]);
    const newTabs = tabs.filter(t => !tabsToRemove.has(t.id));
    
    // Determine fallback tab if active tab is closed
    if (tabsToRemove.has(activeTabId)) {
      const closingTab = tabs.find(t => t.id === activeTabId);
      if (closingTab?.parentId && newTabs.find(t => t.id === closingTab.parentId)) {
        setActiveTabId(closingTab.parentId); // Fall back to parent
      } else {
        setActiveTabId(newTabs[0]?.id || 'archives');
      }
    }
    
    setTabs(newTabs);
  };

  const handleOpenWeek = (weekId: string) => {
    const targetTabId = `week-${weekId}`;
    if (!tabs.find(t => t.id === targetTabId)) {
      const week = mockWeeks.find(w => w.id === weekId);
      if (week) {
        setTabs([...tabs, { id: targetTabId, type: 'week', weekId, baseLabel: week.weekName, closable: true }]);
      }
    }
    setActiveTabId(targetTabId);
  };

  // Drill-down handlers (Now span new tabs)
  const handleReadMore = (narrativeId: string) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && activeTab.type === 'week') {
      const narrativeTabId = `narrative-${narrativeId}`;
      const week = mockWeeks.find(w => w.id === activeTab.weekId);
      const narrative = week?.narratives.find(n => n.id === narrativeId);
      const label = narrative ? narrative.headline : 'Narrative Detail';

      setTabs(prev => {
        if (!prev.find(t => t.id === narrativeTabId)) {
          return [...prev, {
            id: narrativeTabId,
            type: 'week',
            weekId: activeTab.weekId,
            narrativeId,
            baseLabel: label,
            closable: true,
            parentId: `week-${activeTab.weekId}`
          }];
        }
        return prev;
      });
      setActiveTabId(narrativeTabId);
    }
  };

  const handleTrendClick = (trendId: string) => {
    const trendTabId = `trend-${trendId}`;
    const trend = mockTrends.find(t => t.id === trendId);
    const label = trend ? trend.name : 'Trend Detail';

    setTabs(prev => {
      if (!prev.find(t => t.id === trendTabId)) {
        return [...prev, {
          id: trendTabId,
          type: 'trends',
          trendId,
          baseLabel: label,
          closable: true,
          parentId: 'trends'
        }];
      }
      return prev;
    });
    setActiveTabId(trendTabId);
  };

  const handleNarrativeClickFromTrend = (narrativeId: string, weekId: string) => {
    const parentTabId = `week-${weekId}`;
    const narrativeTabId = `narrative-${narrativeId}`;

    const week = mockWeeks.find(w => w.id === weekId);
    const narrative = week?.narratives.find(n => n.id === narrativeId);
    const label = narrative ? narrative.headline : 'Narrative Detail';

    setTabs(prev => {
      const newTabs = [...prev];
      // Auto-open parent week tab if not present
      if (!newTabs.find(t => t.id === parentTabId)) {
        newTabs.push({ id: parentTabId, type: 'week', weekId, baseLabel: week?.weekName || 'Week', closable: true });
      }
      // Open the narrative child tab
      if (!newTabs.find(t => t.id === narrativeTabId)) {
        newTabs.push({
          id: narrativeTabId,
          type: 'week',
          weekId,
          narrativeId,
          baseLabel: label,
          closable: true,
          parentId: parentTabId
        });
      }
      return newTabs;
    });
    setActiveTabId(narrativeTabId);
  };

  const handleBack = () => {
    handleCloseTab(activeTabId);
  };

  // Render logic based on the ACTIVE tab's internal state
  const renderContent = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return null;

    if (activeTab.type === 'trends') {
      if (activeTab.trendId) {
        const trend = mockTrends.find(t => t.id === activeTab.trendId);
        if (trend) return <TrendDetail trend={trend} onBack={handleBack} onNarrativeClick={handleNarrativeClickFromTrend} />;
      }
      return <Trends onSelectTrend={handleTrendClick} />;
    }

    if (activeTab.type === 'claims') {
      return <Claims />;
    }

    if (activeTab.type === 'archives') {
      return <Archives onOpenWeek={handleOpenWeek} />;
    }

    if (activeTab.type === 'week' && activeTab.weekId) {
      const week = mockWeeks.find(w => w.id === activeTab.weekId);
      if (week) {
        if (activeTab.narrativeId) {
          const narrative = week.narratives.find(n => n.id === activeTab.narrativeId);
          if (narrative) return <NarrativeDetail narrative={narrative} onBack={handleBack} onTrendClick={handleTrendClick} />;
        }
        return <WeekReport week={week} onReadMore={handleReadMore} onTrendClick={handleTrendClick} />;
      }
    }

    return <div>Content not found</div>;
  };

  return (
    <div className="app-container">
      <Masthead />

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