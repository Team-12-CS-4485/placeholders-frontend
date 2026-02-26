import React from 'react';
import type { TabData } from '../../App';
import { mockWeeks, mockTrends } from '../../data/mockData';

interface FolderTabsProps {
  tabs: TabData[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
}

export const FolderTabs: React.FC<FolderTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onCloseTab
}) => {

  // Generate breadcrumb-style label
  const getDisplayLabel = (tab: TabData) => {
    // Week narrative drill-down
    if (tab.type === 'week' && tab.narrativeId) {
      const narrative = mockWeeks
        .find(w => w.id === tab.weekId)
        ?.narratives.find(n => n.id === tab.narrativeId);

      if (narrative) {
        return `${tab.baseLabel} > ${narrative.headline}`;
      }
    }

    // Trend drill-down
    if (tab.type === 'trends' && tab.trendId) {
      const trend = mockTrends.find(t => t.id === tab.trendId);

      if (trend) {
        return `${tab.baseLabel} > ${trend.name}`;
      }
    }

    return tab.baseLabel;
  };

  return (
    <nav className="folder-tabs" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const displayLabel = getDisplayLabel(tab);

        return (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={displayLabel}
          >
            <span className="tab-label-text">
              {displayLabel}
            </span>

            {tab.closable && (
              <button
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                aria-label="Close tab"
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};