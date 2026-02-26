import React from 'react';

interface Tab {
  id: string;
  label: string;
  closable: boolean;
}

interface FolderTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({ tabs, activeTab, onTabChange, onCloseTab }) => {
  return (
    <nav className="folder-tabs" aria-label="Main Navigation">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span>{tab.label}</span>
          {tab.closable && (
            <button 
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab.id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, color: 'inherit', padding: '0 2px' }}
              aria-label="Close tab"
            >
              &times;
            </button>
          )}
        </div>
      ))}
    </nav>
  );
};