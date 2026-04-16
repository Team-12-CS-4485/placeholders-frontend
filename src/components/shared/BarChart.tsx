import React, { useState } from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

/**
 * Proportionally-scaled bar chart for the TrendDetail engagement volume section.
 *
 * Fixes vs. the inline chart in TrendDetail.tsx:
 *  - Height is normalized: bar_height = (value / maxValue) * innerHeight
 *  - Handles edge cases: all-zero, single bar, very large ranges
 *  - Adds a Y-axis with human-readable tick labels (K / M suffixes)
 *  - Hover tooltip shows exact value
 *  - Baseline (0) is always drawn
 *  - Equal spacing between bars with a configurable gap ratio
 *  - Labels truncated cleanly on overflow
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 220,
  color = 'var(--ink-heavy)',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <p style={{ color: 'var(--ink-faded)', fontStyle: 'italic', fontSize: '0.9rem' }}>
        No data available.
      </p>
    );
  }

  // ── Layout constants ──────────────────────────────────────────────────────
  const LABEL_H = 36;   // px reserved below bars for x-axis labels
  const Y_AXIS_W = 48;  // px reserved left of bars for y-axis ticks
  const BAR_GAP = 0.25; // fraction of slot width that is gap (0.25 = 25%)
  const CHART_H = height - LABEL_H;

  // ── Scaling ───────────────────────────────────────────────────────────────
  const maxVal = Math.max(...data.map(d => d.value), 1); // avoid div-by-zero

  // Round maxVal up to a "nice" ceiling for y-axis ticks
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const niceCeil = Math.ceil(maxVal / magnitude) * magnitude;

  // Y-axis ticks: 0, 25%, 50%, 75%, 100% of niceCeil
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * niceCeil));

  const formatTick = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return String(n);
  };

  // Bar height in px for a given value
  const barH = (val: number) => {
    if (niceCeil === 0) return 0;
    return Math.max(2, (val / niceCeil) * (CHART_H - 8)); // -8 for top breathing room
  };

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      <div style={{ display: 'flex', width: '100%' }}>
        {/* Y-axis */}
        <div
          style={{
            width: Y_AXIS_W,
            flexShrink: 0,
            height: CHART_H,
            position: 'relative',
            borderRight: '1px solid var(--ink-heavy)',
          }}
        >
          {ticks.map((tick) => {
            const topPct = 100 - (tick / niceCeil) * 100;
            return (
              <div
                key={tick}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: `${topPct}%`,
                  transform: 'translateY(-50%)',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '0.65rem',
                  color: 'var(--ink-faded)',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatTick(tick)}
              </div>
            );
          })}
        </div>

        {/* Chart area */}
        <div
          style={{
            flex: 1,
            height: CHART_H,
            position: 'relative',
            backgroundImage: ticks
              .map((tick) => {
                const pct = 100 - (tick / niceCeil) * 100;
                return `linear-gradient(transparent calc(${pct}% - 0.5px), rgba(0,0,0,0.08) calc(${pct}% - 0.5px), rgba(0,0,0,0.08) calc(${pct}% + 0.5px), transparent calc(${pct}% + 0.5px))`;
              })
              .join(', '),
          }}
        >
          {/* Bars */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0 4px',
              gap: 0,
            }}
          >
            {data.map((d, i) => {
              const bh = barH(d.val ?? d.value);
              const isHovered = hoveredIdx === i;
              const slotW = `${100 / data.length}%`;
              const gapPct = BAR_GAP * 50; // half-gap on each side as % of slot

              return (
                <div
                  key={i}
                  style={{
                    width: slotW,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'crosshair',
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    style={{
                      width: `${100 - gapPct * 2}%`,
                      height: bh,
                      backgroundColor: isHovered ? 'var(--ink-faded)' : color,
                      transition: 'background-color 0.15s ease, height 0.3s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          marginBottom: 6,
                          backgroundColor: 'var(--ink-heavy)',
                          color: 'var(--bg-paper)',
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: '0.72rem',
                          padding: '3px 7px',
                          whiteSpace: 'nowrap',
                          zIndex: 20,
                          pointerEvents: 'none',
                        }}
                      >
                        {formatTick(d.val ?? d.value)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Baseline */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              backgroundColor: 'var(--ink-heavy)',
            }}
          />
        </div>
      </div>

      {/* X-axis labels */}
      <div
        style={{
          display: 'flex',
          marginLeft: Y_AXIS_W,
          height: LABEL_H,
          alignItems: 'flex-start',
          paddingTop: 6,
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              width: `${100 / data.length}%`,
              textAlign: 'center',
              fontFamily: "'Courier Prime', monospace",
              fontSize: data.length > 8 ? '0.6rem' : '0.7rem',
              color: hoveredIdx === i ? 'var(--ink-heavy)' : 'var(--ink-faded)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 2px',
              transition: 'color 0.15s',
            }}
            title={d.label}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};
