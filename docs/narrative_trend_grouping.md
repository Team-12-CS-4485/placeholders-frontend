# Narrative Trend Grouping with Dynamic Engagement Bylines

## What This Does

The WeekReport now **groups narratives by their primary trend** with decorative rule dividers separating each trend section. This creates a newspaper-style layout where stories are visually organized by topic, helping readers quickly scan the week's coverage.

**Key improvements:**
- **Trend-based organization**: All stories for Tech appear together, then all stories for Politics, etc.
- **Smart dividers**: Rule dividers appear only for trends with main-grid narratives (classified low-engagement stories don't get empty dividers)
- **Enhanced bylines**: Shows engagement volume, claim count, and breaking status instead of generic bureau/date labels
- **Relative classifieds threshold**: Low-engagement narratives automatically move to a "Classified Notices" section based on 15% of the week's top story's engagement
- **Drop caps on all narratives**: Newspaper-style drop caps now appear on every narrative summary for visual consistency

---

## Why This Matters

**Before:** All narratives appeared in a flat list sorted only by engagement volume. No topic organization.

**After:** Readers can instantly see which trends have the most coverage (most narratives), discover related stories grouped together, and easily distinguish high-engagement narrative coverage from low-engagement notices. The byline now tells the real story: how engaged audiences are with each narrative.

---

## Files You Will Touch

| File | What Changed |
|---|---|
| `src/types/index.ts` | Added `claimCount?: number` to `Narrative` interface |
| `src/lib/adapters.ts` | Map `claimCount` from backend, cap `fullText` at 2 items, removed unused `truncate()` |
| `src/components/views/WeekReport.tsx` | Trend grouping logic, relative classifieds threshold, new byline, drop-cap on all narratives |
| `src/index.css` | Reduced drop-cap size/margin for better readability, hidden scrollbar on tab overflow |

---

## Understanding the Changes

### 1. Trend Grouping Logic (`src/components/views/WeekReport.tsx`)

**Building the trend order:**
```ts
// Only include trends that have non-classified narratives
const mainGridNarratives = orderedNarratives.filter(n => !classifiedIds.has(n.id));
const trendOrder = mainGridNarratives
  .map(n => n.trendIds[0])  // Use primary (first) trend
  .filter((id, idx, arr) => arr.indexOf(id) === idx);  // Deduplicate while preserving order
```

**Grouping narratives:**
```ts
const narrativesByTrend = orderedNarratives.reduce(
  (acc, narrative) => {
    const primaryTrendId = narrative.trendIds[0];
    if (!acc[primaryTrendId]) acc[primaryTrendId] = [];
    acc[primaryTrendId].push(narrative);
    return acc;
  },
  {} as Record<string, typeof orderedNarratives>
);
```

**Why this works:**
- `trendOrder` only includes trends with visible narratives (skips trends where all narratives are classified)
- `narrativesByTrend` maps trend IDs to their narratives
- When rendering, we iterate `trendOrder` and show divider + narratives for each trend

### 2. Relative Classifieds Threshold

```ts
const maxViews = orderedNarratives[0]?.viewCount ?? 0;
const classifiedThreshold = maxViews > 0 ? maxViews * 0.15 : 0;

// Narratives with viewCount < (maxViews * 0.15) go to Classifieds
```

**Why 15%?** It's aggressive enough to catch genuinely low-engagement stories but not so harsh that a slow week suddenly classifies everything. Adjust the multiplier if testing shows it needs tuning.

**Edge case:** If all narratives have `viewCount` undefined or zero, `classifiedThreshold = 0` and nothing gets classified. This prevents false positives in weeks without heat data.

### 3. Claim Count Mapping

In `adaptWeekNarrativesList`:
```ts
claimCount: item.top_claims.length,  // Backend already provides top_claims array
```

The backend's `top_claims` is a lightweight proxy for claim count (not all claims, just top ones). This avoids an extra API call and gives readers a sense of how contentious each narrative is.

### 4. Context Items Capped at 2

```ts
fullText: (item.top_claims.length ? item.top_claims : item.top_topics).slice(0, 2),
```

Reduces visual noise in the fact-card sidebar. Readers can click "Continued on page X" to see the full detail view if they want more context.

### 5. Drop Caps on All Narratives

Changed from:
```tsx
{isHero
  ? <div className="drop-cap-block"><p>{summary}</p></div>
  : <p>{summary}</p>
}
```

To:
```tsx
<div className="drop-cap-block"><p>{summary}</p></div>
```

**CSS adjustment for readability:**
```css
.drop-cap-block p::first-letter {
  font-size: 3.2rem;  /* reduced from 4.2rem */
  margin: 0px 2px 0 0;  /* reduced from 0px 4px 0 0 for tighter text wrap */
  line-height: 0.85;
}
```

---

## Testing the Feature

1. **Run the app:** `npm run dev`
2. **Visit the Front Page** — you should see:
   - Rule dividers like `— Technology —` above each trend's narratives
   - Bylines showing e.g. "42.1K views · 3 claims · Breaking" instead of bureau names
   - Drop caps on ALL narrative summaries (not just the hero)
   - Low-engagement stories at the bottom under "Classified Notices"

3. **Verify no empty dividers:**
   - If a trend's only narratives are all classified (low engagement), that trend should have NO divider in the main grid
   - Trend should still appear in classifieds if classified narratives exist

4. **Build:** `npm run build` — no TypeScript errors

---

## Future Enhancements

- **Smart narrative ordering within trends**: Sort by viewCount desc within each trend group (currently uses global order)
- **Configurable threshold**: Make the 15% multiplier editable via settings
- **Claim count from detail view**: Once narrative detail claims are loaded, use real claim count instead of `top_claims` proxy
- **Multi-trend narratives**: If a narrative belongs to multiple trends equally, consider showing it once per trend or using a "trending across N topics" badge
- **Scrollable trend groups**: Collapsible trend sections if the page gets too long with many trends

---

## Notes for Future Developers

- **Primary trend selection:** Narratives use `trendIds[0]` (first trend) as primary. If your backend changes how trends are ordered, update the grouping logic accordingly.
- **Classified items are excluded early:** The classifieds filter happens in the adapter layer, not the component. This keeps the component clean but means the adapter needs to know about engagement thresholds in the future.
- **Rule dividers use CSS Grid:** The `gridColumn: '1 / -1'` spans full width. If you change the grid structure, test divider spanning.
