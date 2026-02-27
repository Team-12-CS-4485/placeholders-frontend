import React, { useEffect, useRef } from 'react';
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
  const scrollContainerRef = useRef<HTMLElement>(null);

  // Auto-scroll to the active tab whenever it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector('.tab.active');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center' // Centers the tab in the scrollable area
        });
      }
    }
  }, [activeTabId]);

  const baseTabs = tabs.filter(tab => !tab.parentId);

  return (
    <nav ref={scrollContainerRef} className="folder-tabs-container" aria-label="Main Navigation">
      {baseTabs.map((baseTab) => {
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