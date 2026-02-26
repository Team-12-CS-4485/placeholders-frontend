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

  // Helper to update the currently active tab's state
  const updateActiveTab = (updates: Partial<TabData>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId('archives'); // Fallback to archives if closing the active tab
    }
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

  // Drill-down handlers
  const handleReadMore = (narrativeId: string) => {
    updateActiveTab({ narrativeId });
  };

  const handleTrendClick = (trendId: string) => {
    // Switch to the Trends tab and set its drill-down state
    setTabs(prev => prev.map(t => t.id === 'trends' ? { ...t, trendId } : t));
    setActiveTabId('trends');
  };

  const handleNarrativeClickFromTrend = (narrativeId: string, weekId: string) => {
    const targetTabId = `week-${weekId}`;
    const existingTab = tabs.find(t => t.id === targetTabId);

    if (existingTab) {
      // Update existing week tab and switch to it
      setTabs(prev => prev.map(t => t.id === targetTabId ? { ...t, narrativeId } : t));
    } else {
      // Open the week tab in the background, set its narrative, and switch to it
      const week = mockWeeks.find(w => w.id === weekId);
      if (week) {
        setTabs(prev => [...prev, { id: targetTabId, type: 'week', weekId, narrativeId, baseLabel: week.weekName, closable: true }]);
      }
    }
    setActiveTabId(targetTabId);
  };

  const handleBack = () => {
    updateActiveTab({ narrativeId: null, trendId: null });
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
