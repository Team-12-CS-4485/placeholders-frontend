import React, { useState, useEffect } from 'react';
import type { VideoDetailData } from '../../types';
import { fetchVideoDetail } from '../../services/api';
import { formatCount } from '../../lib/weekUtils';

interface VideoDetailProps {
  videoId: string;
  onBack: () => void;
}

export const VideoDetail: React.FC<VideoDetailProps> = ({ videoId, onBack }) => {
  const [video, setVideo] = useState<VideoDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchVideoDetail(videoId).then(res => {
      import('../../lib/adapters').then(({ adaptVideoDetail }) => {
        if (!cancelled) {
          setVideo(adaptVideoDetail(res));
          setIsLoading(false);
        }
      });
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [videoId]);

  if (isLoading) {
    return (
      <section className="view-section" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p className="font-mono">Loading forensics data...</p>
      </section>
    );
  }

  if (!video) {
    return (
      <section className="view-section">
        <button className="btn-back" onClick={onBack}>&larr; Back</button>
        <p>Video not found or processing failed.</p>
      </section>
    );
  }

  // Calculate sentiment position for the badge
  const isNegative = video.sentiment.toLowerCase() === 'negative';
  const isPositive = video.sentiment.toLowerCase() === 'positive';
  const sentimentPos = isNegative ? 10 : isPositive ? 90 : 50;

  // Helper function to format the raw transcript into a readable dialogue format
  const renderTranscript = (rawText: string) => {
    if (!rawText) return <p style={{ fontStyle: 'italic', color: 'var(--ink-faded)' }}>No transcript available for this file.</p>;
    
    // 1. Normalize HTML entities (DO NOT strip newlines yet, just in case future API calls have them)
    const normalized = rawText.replace(/&gt;&gt;/g, '>>');
    
    // 2. Split by speaker markers
    const speakerBlocks = normalized.split('>>').map(s => s.trim()).filter(Boolean);

    return speakerBlocks.map((block, blockIdx) => {
      // 3. Split the speaker's block by actual newlines (if any exist) 
      // OR by sentences to break up massive walls of text.
      // This regex splits on spaces following a period, question mark, or exclamation mark, 
      // but ONLY if preceded by at least 2 lowercase letters (to avoid splitting "Mr. ", "Dr. ") 
      // and followed by a capital letter or quote.
      const sentences = block.split(/(?<=[a-z]{2,}[.?!])\s+(?=[A-Z"'])/);

      return (
        <div key={blockIdx} className="transcript-line" style={{ display: 'flex', marginBottom: '24px', alignItems: 'flex-start' }}>
          <span 
            className="font-mono" 
            style={{ 
              color: 'var(--ink-faded)', 
              fontWeight: 'bold', 
              marginRight: '12px',
              marginTop: '2px', // Align visually with the text line-height
              userSelect: 'none' 
            }}
          >
            &gt;&gt;
          </span>
          <div className="text" style={{ flex: 1, lineHeight: '1.6' }}>
            {sentences.map((sentence, sIdx) => (
              <span key={sIdx} style={{ display: 'block', marginBottom: '10px' }}>
                {sentence}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <section className="view-section video-forensics-page">
      <button className="btn-back" onClick={onBack}>&larr; Back to Report</button>

      {/* Forensic Report Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink-heavy)', paddingBottom: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>FORENSIC ANALYSIS REPORT</span>
          <span className="font-mono" style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-aged)', border: '1px solid var(--ink-heavy)', padding: '2px 6px' }}>
            ID: #{video.id}
          </span>
          {isNegative && (
            <span className="font-mono" style={{ fontSize: '0.75rem', backgroundColor: '#d90000', color: 'white', padding: '2px 6px', fontWeight: 'bold' }}>
              HIGH NEGATIVE IMPACT
            </span>
          )}
        </div>
      </div>

      <div className="masthead" style={{ borderBottom: 'none', marginBottom: '20px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.5rem', textTransform: 'none', letterSpacing: 'normal', marginBottom: '10px' }}>{video.title}</h1>
        <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>
          {video.channel} | Published: {new Date(video.publishedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="newspaper-grid">
        {/* Main Column: Video & Transcript */}
        <div className="col-span-8 article-block">
          
          <div className="video-container">
            <iframe 
              src={`https://www.youtube.com/embed/${video.id}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', marginBottom: '10px' }}>
             <h3 style={{ margin: 0 }}>Raw Transcript</h3>
          </div>

          <div className="transcript-container">
            {renderTranscript(video.transcript)}
          </div>

          {video.description && (
            <>
              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Video Description</h3>
              <div className="font-mono" style={{ fontSize: '0.85rem', backgroundColor: 'var(--bg-aged)', padding: '15px', border: '1px solid var(--ink-heavy)', whiteSpace: 'pre-wrap' }}>
                {video.description}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Column: Forensics Data */}
        <div className="col-span-4 vertical-divider forensic-panel">
          
          {/* Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 'bold' }}>
                {formatCount(video.viewCount)}
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-faded)' }}>VIEWS</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--ink-heavy)', borderRight: '1px solid var(--ink-heavy)' }}>
              <div style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 'bold' }}>
                {formatCount(video.likeCount)}
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-faded)' }}>LIKES</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 'bold' }}>
                {formatCount(video.commentCount)}
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--ink-faded)' }}>COMMENTS</div>
            </div>
          </div>

          {/* Key Claims */}
          {video.keyClaims.length > 0 && (
            <>
              <h3>Identified Claims</h3>
              <ul style={{ paddingLeft: '15px', marginBottom: '30px', fontSize: '0.9rem' }}>
                {video.keyClaims.map((claim, idx) => (
                  <li key={idx} style={{ marginBottom: '8px' }}>"{claim}"</li>
                ))}
              </ul>
            </>
          )}

          {/* Topics */}
          {video.topics.length > 0 && (
            <>
              <h3>Mapped Topics</h3>
              <div style={{ marginBottom: '30px' }}>
                {video.topics.map(topic => (
                  <span key={topic} className="entity-tag">{topic}</span>
                ))}
              </div>
            </>
          )}

          {/* Top Comments */}
          {video.topComments.length > 0 && (
            <>
              <h3>Audience Pulse (Top Comments)</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                {video.topComments.map((comment, idx) => (
                  <li key={idx} style={{ marginBottom: '15px', borderBottom: '1px dotted var(--ink-heavy)', paddingBottom: '10px' }}>
                    <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px' }}>
                      {comment.author} <span style={{ color: 'var(--ink-faded)', fontWeight: 'normal' }}>• {comment.likes} likes</span>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>{comment.text}</div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Sentiment Analysis */}
          <h3>Sentiment Check <span style={{float: 'right', fontSize: '1rem', fontFamily: 'Courier Prime', fontWeight: 'bold', textTransform: 'uppercase'}}>{video.sentiment}</span></h3>
          <div style={{ marginBottom: '30px', backgroundColor: 'var(--bg-paper)', padding: '15px', border: '1px solid var(--ink-heavy)' }}>
            <div className="sentiment-bar">
              <div className="sentiment-marker" style={{ left: `${sentimentPos}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Courier Prime', fontSize: '0.65rem', color: 'var(--ink-faded)', textTransform: 'uppercase' }}>
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};