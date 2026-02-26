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
            {mockWeeks.slice(1).map(week => (
              <li key={week.id} className="classified-item" style={{ cursor: 'pointer' }} onClick={() => onOpenWeek(week.id)}>
                <span className="classified-meta">{week.dateRange}</span>
                <div className="classified-title">{week.weekName}</div>
                <p style={{ fontSize: '0.9rem' }}>{week.summary.headline}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};