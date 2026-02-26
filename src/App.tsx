import { useState } from 'react';
import type { TabId } from './types';
import { Masthead } from './components/layout/Masthead';
import { FolderTabs } from './components/layout/FolderTabs';
import { FrontPage } from './components/views/FrontPage';
import { NarrativeDetail } from './components/views/NarrativeDetail';
import { Classifieds } from './components/views/Classifieds';
import { Trends } from './components/views/Trends';
import { TrendDetail } from './components/views/TrendDetail';
import { mockNarratives, mockTrends } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('front-page');
  
  // State for drill-down views
  const [activeNarrativeId, setActiveNarrativeId] = useState<string | null>(null);
  const [activeTrendId, setActiveTrendId] = useState<string | null>(null);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Reset drill-down states when switching main tabs
    setActiveNarrativeId(null);
    setActiveTrendId(null);
  };

  // Render logic for Front Page / Narrative Detail
  const renderFrontPage = () => {
    if (activeNarrativeId) {
      const narrative = mockNarratives.find(n => n.id === activeNarrativeId);
      if (narrative) {
        return <NarrativeDetail narrative={narrative} onBack={() => setActiveNarrativeId(null)} />;
      }
    }
    return <FrontPage onReadMore={setActiveNarrativeId} />;
  };

  // Render logic for Trends / Trend Detail
  const renderTrends = () => {
    if (activeTrendId) {
      const trend = mockTrends.find(t => t.id === activeTrendId);
      if (trend) {
        return <TrendDetail trend={trend} onBack={() => setActiveTrendId(null)} />;
      }
    }
    return <Trends onSelectTrend={setActiveTrendId} />;
  };

  return (
    <div className="app-container">
      <Masthead />
      <FolderTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="folder-content">
        {activeTab === 'front-page' && renderFrontPage()}
        {activeTab === 'classifieds' && <Classifieds />}
        {activeTab === 'trends' && renderTrends()}
      </main>
    </div>
  );
}

export default App;