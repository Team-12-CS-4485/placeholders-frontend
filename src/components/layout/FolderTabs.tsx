import React from 'react';
import type { TabData } from '../../App';

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

  // Isolate parent "folder" tabs
  const baseTabs = tabs.filter(tab => !tab.parentId);

  return (
    <nav className="folder-tabs-container" aria-label="Main Navigation">
      {baseTabs.map((baseTab) => {
        // Find dynamically generated child tabs belonging to this folder
        const children = tabs.filter(t => t.parentId === baseTab.id);

        return (
          <div key={`group-${baseTab.id}`} className="tab-group">
            {/* The Parent Tab */}
            <div
              className={`tab ${activeTabId === baseTab.id ? 'active' : ''}`}
              onClick={() => onTabChange(baseTab.id)}
              title={baseTab.baseLabel}
            >
              <span className="tab-label-text">
                {baseTab.baseLabel}
              </span>
              {baseTab.closable && (
                <button
                  className="tab-close-btn"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(baseTab.id); }}
                  aria-label="Close tab"
                >&times;</button>
              )}
            </div>

            {/* Child Dynamic Tabs */}
            {children.map(childTab => (
              <div
                key={childTab.id}
                className={`tab child-tab ${activeTabId === childTab.id ? 'active' : ''}`}
                onClick={() => onTabChange(childTab.id)}
                title={childTab.baseLabel}
              >
                <span className="tab-label-text">
                  {childTab.baseLabel}
                </span>
                {childTab.closable && (
                  <button
                    className="tab-close-btn"
                    onClick={(e) => { e.stopPropagation(); onCloseTab(childTab.id); }}
                    aria-label="Close detail tab"
                  >&times;</button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </nav>
  );
};