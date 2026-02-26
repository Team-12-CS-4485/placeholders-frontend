import { useState } from 'react';
import type { TabId } from './types';
import { Masthead } from './components/layout/Masthead';
import { FolderTabs } from './components/layout/FolderTabs';
import { FrontPage } from './components/views/FrontPage';
import { Classifieds } from './components/views/Classifieds';
import { Business } from './components/views/Business';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('front-page');

  return (
    <div className="app-container">
      <Masthead />
      <FolderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="folder-content">
        {activeTab === 'front-page' && <FrontPage />}
        {activeTab === 'classifieds' && <Classifieds />}
        {activeTab === 'business' && <Business />}
      </main>
    </div>
  );
}

export default App;