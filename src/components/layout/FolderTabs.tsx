import React from 'react';
import { type TabId } from '../../types';

interface FolderTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'front-page', label: '1. The Front Page' },
    { id: 'classifieds', label: '2. The Classifieds (Claims)' },
    { id: 'business', label: '3. Business Section (Trends)' },
  ];

  return (
    <nav className="folder-tabs" aria-label="Main Navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};