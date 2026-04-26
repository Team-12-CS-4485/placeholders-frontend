import React, { useMemo } from 'react';

interface FooterProps {
  onArchiveIndex?: () => void;
  version?: string;
}

export const Footer: React.FC<FooterProps> = ({
  onArchiveIndex,
  version = 'v2.4.0-PRIME',
}) => {
  const lastSync = useMemo(() => new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }), []);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col footer-col--left">
          <span className="footer-status">
            <span className="footer-status-dot" aria-hidden="true">●</span>
            {' '}STATUS: 200 OK
          </span>
          <span>REF: {version}</span>
          <span>LOC: US-EAST</span>
        </div>

        <div className="footer-col footer-col--center">
          <span>© 2026 NEWSIFY</span>
          <span className="footer-brand">THE INVESTIGATIVE ARCHIVE</span>
          <span>AUTOMATED INTELLIGENCE</span>
        </div>

        <div className="footer-col footer-col--right">
          <span>LAST SYNC: {lastSync}</span>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Access</a>
            {onArchiveIndex && (
              <button
                type="button"
                className="footer-link footer-link--btn"
                onClick={onArchiveIndex}
                title="Open the Archive Index tab"
              >
                Archive Index
              </button>
            )}
          </nav>
          <button
            type="button"
            className="footer-back-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Return to top of page"
          >
            [↑] RETURN TO MASTHEAD
          </button>
        </div>
      </div>

      <div className="footer-fine-print">
        INTELLIGENCE HARVESTED FROM YOUTUBE DATA API v3 AND SOCIAL DISCOURSE VECTORS — FOR RESEARCH PURPOSES ONLY
      </div>
    </footer>
  );
};
