import React, { useRef, useState, useEffect } from 'react';

interface MiniGraphProps {
  data: number[];
  color?: string;
  showTooltip?: boolean;
}

/**
 * SVG sparkline that renders geometrically accurate circles.
 *
 * Root cause of oval dots: using preserveAspectRatio="none" with a square
 * viewBox caused the SVG to stretch non-uniformly, turning r=3 circles into
 * ovals. Fix: measure the actual rendered pixel dimensions via ResizeObserver
 * and build the SVG viewBox to exactly match the real pixel size so that
 * 1 SVG unit = 1 CSS pixel. Circle radii stay circular regardless of the
 * container's aspect ratio.
 */
export const MiniGraph: React.FC<MiniGraphProps> = ({
  data,
  color = 'var(--ink-heavy)',
  showTooltip = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 200, h: 50 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number } | null>(null);

  // Measure real pixel dimensions so coordinate system matches rendered size
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const measure = () => {
      setDims({ w: el.clientWidth || 200, h: el.clientHeight || 50 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const { w: W, h: H } = dims;

  // ── Layout ────────────────────────────────────────────────────────────────
  const PAD_TOP = 6;
  const PAD_BOTTOM = 6;
  const PAD_LEFT = 4;
  const PAD_RIGHT = 4;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  // ── Normalization ─────────────────────────────────────────────────────────
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const toX = (i: number) =>
    PAD_LEFT + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);

  const toY = (val: number) => {
    if (range === 0) return PAD_TOP + innerH / 2;
    return PAD_TOP + innerH - ((val - min) / range) * innerH;
  };

  const points = data.map((val, i) => ({ x: toX(i), y: toY(val), val }));

  // ── Smooth path (Catmull-Rom → cubic bezier) ──────────────────────────────
  const buildPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    if (pts.length === 2)
      return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

    const tension = 0.3;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  };

  const linePath = buildPath(points);
  const areaPath =
    `${linePath} L ${points[points.length - 1].x},${H - PAD_BOTTOM} L ${PAD_LEFT},${H - PAD_BOTTOM} Z`;

  // Dot radius in real pixels (safe because viewBox == pixel dims)
  const DOT_R = 3.5;

  // ── Hover handling ────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!showTooltip || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    let nearest = points[0];
    let minDist = Math.abs(points[0].x - relX);
    for (const pt of points) {
      const d = Math.abs(pt.x - relX);
      if (d < minDist) { minDist = d; nearest = pt; }
    }
    setTooltip({ x: nearest.x, y: nearest.y, value: nearest.val });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {W > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseMove={showTooltip ? handleMouseMove : undefined}
          onMouseLeave={showTooltip ? () => setTooltip(null) : undefined}
        >
          {/* Filled area */}
          <path d={areaPath} fill={color} fillOpacity={0.08} stroke="none" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots — perfect circles because 1 SVG unit = 1 CSS px */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={DOT_R}
              fill="var(--bg-paper)"
              stroke={color}
              strokeWidth="1.5"
            />
          ))}

          {/* Tooltip crosshair */}
          {showTooltip && tooltip && (
            <>
              <line
                x1={tooltip.x} y1={PAD_TOP}
                x2={tooltip.x} y2={H - PAD_BOTTOM}
                stroke={color}
                strokeWidth="1"
                strokeDasharray="3,2"
              />
              <circle cx={tooltip.x} cy={tooltip.y} r={DOT_R + 2} fill={color} />
            </>
          )}
        </svg>
      )}

      {showTooltip && tooltip && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y - 28,
            left: tooltip.x,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ink-heavy)',
            color: 'var(--bg-paper)',
            fontFamily: "'Courier Prime', monospace",
            fontSize: '0.68rem',
            padding: '2px 6px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {tooltip.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      )}
    </div>
  );
};
