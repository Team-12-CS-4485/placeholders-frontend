import React from 'react';
import { mockWeeks } from '../../data/mockData';

interface ArchivesProps {
  onOpenWeek: (weekId: string) => void;
}

export const Archives: React.FC<ArchivesProps> = ({ onOpenWeek }) => {
  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>Archived Reports</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Past Weekly Intelligence Digests</p>
      </div>

      <div className="newspaper-grid">
        <div className="col-span-12 article-block">
          <ul className="classified-list">
            {/* Removed .slice(1) to include the current week */}
            {mockWeeks.map((week, index) => (
              <li key={week.id} className="classified-item" style={{ cursor: 'pointer' }} onClick={() => onOpenWeek(week.id)}>
                
                {/* Meta Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="classified-meta" style={{ margin: 0 }}>{week.dateRange}</span>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-faded)' }}>
                    {week.narratives.length} Narratives
                  </span>
                </div>
                
                {/* Title & Badge */}
                <div className="classified-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {week.weekName}
                  {index === 0 && (
                    <span className="font-mono" style={{
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--ink-heavy)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      CURRENT WEEK
                    </span>
                  )}
                </div>
                
                {/* Improved Content Info */}
                <p style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '8px' }}>{week.summary.headline}</p>
                
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--ink-standard)', 
                  borderLeft: '2px solid var(--ink-heavy)', 
                  paddingLeft: '10px', 
                  fontStyle: 'italic' 
                }}>
                  {week.narratives.map(n => n.headline).join(' | ')}
                </div>
                
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};