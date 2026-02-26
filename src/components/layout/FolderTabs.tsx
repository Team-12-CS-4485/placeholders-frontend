import React from 'react';
import type { TabId } from '../../types';

interface FolderTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'week-report', label: '1. Weekly Report' },
    { id: 'classifieds', label: '2. Raw Claims' },
    { id: 'trends', label: '3. Trends Analytics' },
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