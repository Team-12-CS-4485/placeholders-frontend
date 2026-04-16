import React, { useState } from 'react';
import { Ticker } from '../shared/Ticker';
import type { SearchMatch } from '../../lib/search';

interface MastheadProps {
  tickerItems: string[];
  onRefresh?: () => void;
  searchQuery?: string;
  searchResults?: SearchMatch[];
  onSearchQueryChange?: (query: string) => void;
  onSearchSelect?: (result: SearchMatch) => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  tickerItems,
  onRefresh,
  searchQuery = '',
  searchResults = [],
  onSearchQueryChange,
  onSearchSelect,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  const currentDate = new Date().toLocaleDateString('en-US', dateOptions);
  const canSearch = Boolean(onSearchQueryChange && onSearchSelect);
  const hasQuery = searchQuery.trim().length > 0;
  const showResults = canSearch && hasQuery && isSearchFocused;
  const activeResultIndex =
    searchResults.length === 0 ? -1 : Math.min(highlightedIndex, searchResults.length - 1);

  const handleSelect = (result: SearchMatch) => {
    onSearchSelect?.(result);
    setIsSearchFocused(false);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
    if (!canSearch) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (searchResults.length === 0) return;
      setHighlightedIndex(index => (index + 1) % searchResults.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (searchResults.length === 0) return;
      setHighlightedIndex(index =>
        index === 0 ? searchResults.length - 1 : index - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      if (activeResultIndex >= 0 && searchResults[activeResultIndex]) {
        event.preventDefault();
        handleSelect(searchResults[activeResultIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const handleSearchAction = () => {
    if (!hasQuery) return;
    onSearchQueryChange?.('');
    setHighlightedIndex(0);
  };

  return (
    <header className="masthead">
      {(canSearch || onRefresh) && (
        <div className="masthead-controls">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh data"
              className="masthead-refresh-btn"
            >
              ↻ Refresh
            </button>
          )}

          {canSearch && (
            <div
              className="masthead-search"
              onBlur={event => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  setIsSearchFocused(false);
                }
              }}
            >
              <label className="sr-only" htmlFor="masthead-search-input">
                Search cached data
              </label>
              <input
                id="masthead-search-input"
                type="text"
                className="masthead-search-input"
                value={searchQuery}
                placeholder="Search weeks, narratives, trends, claims, videos"
                onChange={event => {
                  setHighlightedIndex(0);
                  onSearchQueryChange?.(event.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />

              <button
                type="button"
                className={`masthead-search-action${hasQuery ? ' is-clear' : ' is-idle'}`}
                onMouseDown={event => {
                  if (!hasQuery) {
                    event.preventDefault();
                  }
                }}
                onClick={handleSearchAction}
                aria-label={hasQuery ? 'Clear search' : 'Search'}
                disabled={!hasQuery}
                tabIndex={hasQuery ? 0 : -1}
              >
                {hasQuery ? (
                  <span aria-hidden="true">×</span>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                )}
              </button>

              {showResults && (
                <div className="masthead-search-results" role="listbox">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <button
                        key={result.id}
                        type="button"
                        className={`masthead-search-result${index === activeResultIndex ? ' active' : ''}`}
                        onMouseDown={event => {
                          event.preventDefault();
                          handleSelect(result);
                        }}
                      >
                        <span className="masthead-search-result-meta">{result.kind}</span>
                        <span className="masthead-search-result-title">{result.title}</span>
                        <span className="masthead-search-result-subtitle">{result.subtitle}</span>
                        {result.snippet && (
                          <span className="masthead-search-result-snippet">{result.snippet}</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="masthead-search-empty">
                      No cached matches yet for "{searchQuery.trim()}".
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <h1>Newsify</h1>
      <div style={{ fontStyle: 'italic', fontSize: '1.1rem', marginTop: '-5px' }}>
        The Investigative Archive - YouTube Intelligence
      </div>
      <div className="sub-meta">
        <span>Vol. CXCIV ... No. 59,321</span>
        <span>Automated Weekly Digest</span>
        <span>{currentDate}</span>
      </div>
      <Ticker items={tickerItems} />
    </header>
  );
};
