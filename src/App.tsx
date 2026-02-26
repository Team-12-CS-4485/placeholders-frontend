import { useState } from 'react';
import { Masthead } from './components/layout/Masthead';
import { FolderTabs } from './components/layout/FolderTabs';
import { WeekReport } from './components/views/WeekReport';
import { NarrativeDetail } from './components/views/NarrativeDetail';
import { Trends } from './components/views/Trends';
import { TrendDetail } from './components/views/TrendDetail';
import { Archives } from './components/views/Archives';
import { mockWeeks, mockTrends } from './data/mockData';

function App() {
  const [openTabs, setOpenTabs] = useState<{ id: string; label: string; closable: boolean }[]>([
    { id: 'front-page', label: 'Front Page', closable: false },
    { id: 'trends', label: 'Trends Analytics', closable: false },
    { id: 'archives', label: 'Archives', closable: false },
  ]);
  const [activeTab, setActiveTab] = useState<string>('front-page');
  
  const [activeNarrativeId, setActiveNarrativeId] = useState<string | null>(null);
  const [activeTrendId, setActiveTrendId] = useState<string | null>(null);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setActiveNarrativeId(null);
    setActiveTrendId(null);
  };

  const handleCloseTab = (tabId: string) => {
    const newTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab('archives');
    }
  };

  const handleOpenWeek = (weekId: string) => {
    if (!openTabs.find(t => t.id === weekId)) {
      const week = mockWeeks.find(w => w.id === weekId);
      if (week) {
        setOpenTabs([...openTabs, { id: weekId, label: week.weekName, closable: true }]);
      }
    }
    setActiveTab(weekId);
    setActiveNarrativeId(null);
    setActiveTrendId(null);
  };

  const handleTrendClick = (trendId: string) => {
    setActiveTab('trends');
    setActiveTrendId(trendId);
    setActiveNarrativeId(null);
  };

  const handleNarrativeClick = (narrativeId: string, weekId: string) => {
    let targetTab = weekId;
    if (weekId === mockWeeks[0].id) {
      targetTab = 'front-page';
    } else {
      if (!openTabs.find(t => t.id === weekId)) {
        const week = mockWeeks.find(w => w.id === weekId);
        if (week) {
          setOpenTabs(prev => [...prev, { id: weekId, label: week.weekName, closable: true }]);
        }
      }
    }
    setActiveTab(targetTab);
    setActiveNarrativeId(narrativeId);
    setActiveTrendId(null);
  };

  const renderContent = () => {
    if (activeTab === 'trends') {
      if (activeTrendId) {
        const trend = mockTrends.find(t => t.id === activeTrendId);
        if (trend) return <TrendDetail trend={trend} onBack={() => setActiveTrendId(null)} onNarrativeClick={handleNarrativeClick} />;
      }
      return <Trends onSelectTrend={handleTrendClick} />;
    }

    if (activeTab === 'archives') {
      return <Archives onOpenWeek={handleOpenWeek} />;
    }

    const weekId = activeTab === 'front-page' ? mockWeeks[0].id : activeTab;
    const week = mockWeeks.find(w => w.id === weekId);

    if (week) {
      if (activeNarrativeId) {
        const narrative = week.narratives.find(n => n.id === activeNarrativeId);
        if (narrative) return <NarrativeDetail narrative={narrative} onBack={() => setActiveNarrativeId(null)} />;
      }
      return <WeekReport week={week} onReadMore={(id) => setActiveNarrativeId(id)} onTrendClick={handleTrendClick} />;
    }

    return <div>Tab not found</div>;
  };

  return (
    <div className="app-container">
      <Masthead />
      <FolderTabs 
        tabs={openTabs} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        onCloseTab={handleCloseTab} 
      />
      
      <main className="folder-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;