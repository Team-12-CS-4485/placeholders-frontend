import React from 'react';
import { mockClassifieds } from '../../data/mockData';

export const Classifieds: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'var(--ink-heavy)',
    color: 'var(--bg-paper)',
    padding: '5px',
    textAlign: 'center'
  };

  let currentSpan = 0;

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>The Classifieds: Extracted Evidence</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Categorized Claims -&gt; High-Level Narratives</p>
      </div>

      <div className="newspaper-grid">
        {mockClassifieds.map((category, index) => {
          const span = 4;
          const isNewLine = currentSpan % 12 === 0;
          currentSpan += span;
          
          const colClass = `col-span-${span} ${!isNewLine ? 'vertical-divider' : ''}`.trim();

          return (
            <div key={index} className={`${colClass} article-block`}>
              <h3 style={headerStyle}>{category.title}</h3>
              <ul className="classified-list">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="classified-item">
                    <span className="classified-meta">Narrative Cluster ID: {item.clusterId}</span>
                    <div className="classified-title">{item.title}</div>
                    {item.claims.map((claim, claimIdx) => (
                      <React.Fragment key={claimIdx}>
                        <p style={{ fontSize: '0.9rem' }}>
                          <strong>Extracted Claim:</strong> {claim.text}
                          {claim.source && claim.views && ` (Source: ${claim.source}, ${claim.views} views)`}
                        </p>
                        {claim.warning && (
                          <p style={{ fontSize: '0.9rem' }}>
                            <span className="font-mono" style={{ color: 'red', fontSize: '0.8rem' }}>{claim.warning}</span>
                          </p>
                        )}
                      </React.Fragment>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};