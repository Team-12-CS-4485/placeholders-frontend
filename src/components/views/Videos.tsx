import React, { useState, useEffect } from 'react';
import type { Video } from '../../types';
import { fetchVideosList } from '../../services/api';
import { adaptVideoList } from '../../lib/adapters';

interface VideosProps {
  onVideoClick: (videoId: string) => void;
}

export const Videos: React.FC<VideosProps> = ({ onVideoClick }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    // Fetch an initial batch of 24 to fill 2-3 rows nicely (since it's a 3-column grid)
    fetchVideosList(24).then(res => {
      if (!cancelled) {
        setVideos(adaptVideoList(res));
        setNextCursor(res.next_cursor || null);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Fetch more videos using the cursor
  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchVideosList(24, nextCursor);
      setVideos(prev => [...prev, ...adaptVideoList(res)]);
      setNextCursor(res.next_cursor || null);
    } catch (error) {
      console.error("Failed to load more videos:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <section className="view-section">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>Loading video feed...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view-section">
      <div className="masthead" style={{ borderBottom: '1px solid var(--ink-heavy)', marginBottom: '20px', paddingBottom: '5px' }}>
        <h2>Video Feed</h2>
        <p className="font-mono" style={{ fontSize: '0.9rem' }}>Raw Ingested Source Material</p>
      </div>

      <div className="newspaper-grid">
        {videos.map((video, idx) => (
          <div key={video.id} className={`col-span-4 article-block ${idx % 3 !== 0 ? 'vertical-divider' : ''}`} style={{ marginBottom: '30px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', border: '1px solid var(--ink-heavy)', padding: '5px', backgroundColor: 'var(--bg-aged)' }} onClick={() => onVideoClick(video.id)}>
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} style={{ width: '100%', display: 'block', filter: 'grayscale(100%) contrast(120%)' }} />
              ) : (
                <div style={{ width: '100%', paddingTop: '56.25%', backgroundColor: 'var(--ink-heavy)' }} />
              )}
              <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'var(--bg-paper)', padding: '2px 6px', border: '1px solid var(--ink-heavy)', fontSize: '0.7rem' }} className="font-mono">
                {video.viewCount.toLocaleString()} views
              </div>
            </div>
            
            <h4 
              className="clickable-title" 
              onClick={() => onVideoClick(video.id)}
              style={{ fontSize: '1.2rem', marginTop: '15px', marginBottom: '5px', lineHeight: 1.2 }}
            >
              {video.title}
            </h4>
            
            <p className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--ink-faded)', margin: 0 }}>
              {video.channel} • {new Date(video.publishedAt).toLocaleDateString()}
            </p>
            
            <div style={{ marginTop: '10px' }}>
              <span className="font-mono" style={{ fontSize: '0.7rem', border: '1px solid var(--ink-heavy)', padding: '2px 6px', backgroundColor: 'var(--bg-paper)' }}>
                {video.clusterLabel}
              </span>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <p className="font-mono" style={{ color: 'var(--ink-faded)', gridColumn: 'span 12' }}>No videos indexed.</p>
        )}
      </div>

      {/* Pagination Load More Button */}
      {nextCursor && (
        <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '2px solid var(--ink-heavy)', paddingTop: '30px' }}>
          <button 
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            style={{
              padding: '12px 24px',
              fontFamily: "'Courier Prime', monospace",
              fontSize: '1rem',
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              color: 'var(--ink-heavy)',
              border: '2px solid var(--ink-heavy)',
              cursor: isLoadingMore ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              opacity: isLoadingMore ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoadingMore) {
                e.currentTarget.style.backgroundColor = 'var(--ink-heavy)';
                e.currentTarget.style.color = 'var(--bg-paper)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoadingMore) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ink-heavy)';
              }
            }}
          >
            {isLoadingMore ? 'Connecting to feed...' : '↓ Load More Videos'}
          </button>
        </div>
      )}
    </section>
  );
};