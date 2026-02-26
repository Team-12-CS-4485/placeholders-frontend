import React from 'react';
import { Ticker } from '../shared/Ticker';
import { Highlight } from '../shared/Highlight';

export const FrontPage: React.FC = () => {
  return (
    <section className="view-section">
      <Ticker />

      <div className="newspaper-grid">
        {/* Left Lead Story Column */}
        <div className="col-span-8 article-block">
          <span className="font-mono" style={{ color: 'var(--ink-faded)' }}>NARRATIVE SPOTLIGHT</span>
          <h2>AI Coding Assistants Threaten Junior Developer Roles, Data Suggests</h2>
          <p className="lead">
            In a sweeping analysis of over <Highlight color="yellow">1,500 YouTube videos</Highlight> published this week, a dominant narrative has emerged regarding the future of entry-level software engineering.
          </p>
          
          <p>
            The system has successfully clustered 4,203 individual claims pointing toward a consensus among tech creators: advancements in LLM technology are rapidly automating routine coding tasks. Creators with high credibility scores note that while senior architecture roles remain secure, the demand for junior positions is visibly contracting.
          </p>
          
          <p>
            Specifically, the extracted claim <Highlight color="yellow">"Devin AI successfully resolves 13.86% of GitHub issues unassisted"</Highlight> appeared in 47 independent videos, marking a significant focal point in the discourse. Sentiment surrounding this narrative is currently graded at a polarized 42% Positive and 58% Negative.
          </p>
        </div>

        {/* Right Sidebar Column */}
        <div className="col-span-4 vertical-divider article-block">
          <h3 style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '10px' }}>At a Glance</h3>
          
          <ul className="classified-list" style={{ borderTop: 'none' }}>
            <li className="classified-item">
              <span className="classified-meta">Top Trending Narrative</span>
              <div className="classified-title"><Highlight color="teal">Sustainable Tech Investments</Highlight></div>
              <span className="font-mono">+120% week-over-week</span>
            </li>
            <li className="classified-item">
              <span className="classified-meta">Highest Risk Narrative</span>
              <div className="classified-title"><Highlight color="pink">Unverified Diet Supplements</Highlight></div>
              <span className="font-mono">Toxicity score: 0.85/1.0</span>
            </li>
            <li className="classified-item">
              <span className="classified-meta">Most Viral Claim</span>
              <div className="classified-title"><Highlight color="yellow">"Crypto market impending crash"</Highlight></div>
              <span className="font-mono">Mentioned in 89 videos</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};