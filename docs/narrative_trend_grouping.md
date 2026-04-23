# Narrative Trend Grouping with Dynamic Engagement Bylines

## What This Does

The WeekReport now **groups narratives by their primary trend** with decorative rule dividers separating each trend section. This creates a newspaper-style layout where stories are visually organized by topic, helping readers quickly scan the week's coverage.

**Key improvements:**

- **Trend-based organization**: All stories for Tech appear together, then all stories for Politics, etc.
- **Smart dividers**: Rule dividers appear only for trends with main-grid narratives (classified low-engagement stories don't get empty dividers)
- **Enhanced bylines**: Shows engagement volume, claim count, and breaking status instead of generic bureau/date labels
- **Relative classifieds threshold**: Low-engagement narratives automatically move to a "Classified Notices" section based on 15% of the week's top story's engagement
- **Drop caps on all narratives**: Newspaper-style drop caps now appear on every narrative summary for visual consistency
- **Full-text overviews**: Narrative summaries display in full without truncation, providing readers with necessary context to decide whether to read more

---

## Why This Matters

**Before:** All narratives appeared in a flat list sorted only by engagement volume. No topic organization.

**After:** Readers can instantly see which trends have the most coverage (most narratives), discover related stories grouped together, and easily distinguish high-engagement narrative coverage from low-engagement notices. The byline now tells the real story: how engaged audiences are with each narrative.

---

## Major Design Decisions

### 1. Full Overviews (No Truncation)

After 7 weeks of production clustering data, overviews remain reasonably sized (typically 5-7 lines). The full text provides readers with necessary context to decide whether to click through and read more. The redesigned layout with drop caps and fact-card sidebars accommodates longer paragraphs comfortably, so length won't break the layout.

### 2. Relative Engagement Threshold (15%)

Classifieds threshold is calculated as `maxViews * 0.15` instead of a hardcoded number. This means:

- **Advantage:** Auto-adjusts each week — a "slow news week" won't suddenly classify everything
- **Edge case:** If all narratives have zero/undefined engagement, nothing gets classified (prevents false positives)
- **Rationale:** Aggressive enough to catch genuinely low-engagement stories but forgiving enough for weeks with lower overall engagement

### 3. Primary Trend Selection

Narratives use `trendIds[0]` (first trend) as their primary trend for grouping. Multi-trend narratives appear in only one group. If backend trends ordering changes, grouping logic needs updating.

### 4. Hero Article Styling

Only the first narrative in `orderedNarratives` (by engagement) gets larger font size and drop-cap emphasis. This is a global designation, not per-trend. All other narratives render identically at full width (`col-span-12`).

### 5. Claim Count from `top_claims` Proxy

Backend's `top_claims` array length is used as a lightweight proxy for claim count in bylines. This avoids an extra API call but means it shows "top claims" not "all claims." Users can click through to see complete claim count in detail view.

---

## Files Modified

| File | Changes |
| --- | --- |
| `src/types/index.ts` | Added `claimCount?: number` to Narrative interface |
| `src/lib/adapters.ts` | Map `claimCount` from backend; cap `fullText` at 2 items; removed unused `truncate()` function |
| `src/components/views/WeekReport.tsx` | Trend grouping logic; relative classifieds threshold; dynamic bylines; removed layout overhead; drop-cap on all narratives |
| `src/index.css` | Reduced drop-cap size/margin; hidden scrollbar on tab overflow |
| `src/components/layout/FolderTabs.tsx` | Added arrow key navigation (Left/Right) between tabs |
| `src/components/views/Videos.tsx` | Added caching: only fetch on first load, use cached data on tab navigation |
| `src/App.tsx` | Pass cached videos to Videos component to prevent re-fetches |

---

## Code Quality: Refactoring & Cleanup

### Removed Unnecessary Layout Metadata

**Before:** Used a `reduce()` operation to calculate `span`, `isNewLine`, and `currentSpan` for each narrative, then did an O(n) `.find()` lookup during render to retrieve this static data.

**After:** Removed entirely. All narratives render at `col-span-12` with no dividers — these are constants, not dynamic calculations.

**Impact:**

- Eliminated ~35 lines of boilerplate
- Removed O(n) lookup per narrative during render
- Code is now self-documenting: every narrative uses full width

### Simplified Classifieds Calculation

**Before:** Filtered `narrativesWithLayout` objects, extracted narrative, built a Set of IDs.

**After:** Directly filter `orderedNarratives` with `.slice(1)` to skip hero, then filter by engagement. Cleaner data flow.

### Improved Deduplication

**Before:** `trendOrder = [...].filter((id, idx, arr) => arr.indexOf(id) === idx)` — O(n²) operation.

**After:** `trendOrder = [...new Map([...].map(n => [n.trendIds[0], true])).keys()]` — O(n) using Map insertion ordering.

### Removed Truncation Override

**Before:** Editor's Alert truncated overview to 200 chars.

**After:** Uses full overview, consistent with byline design decision to show full context.

---

## Understanding the Implementation

### Trend Grouping Logic

**Building narrative-to-trend mapping:**

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

**Building trend order (only for non-classified narratives):**

```ts
const mainGridNarratives = orderedNarratives.filter(n => !classifiedIds.has(n.id));
const trendOrder = [...new Map(mainGridNarratives.map(n => [n.trendIds[0], true])).keys()];
```

**Why this works:**

- `narrativesByTrend` maps trend IDs to their narratives
- `trendOrder` only includes trends with visible (non-classified) narratives
- When rendering, we iterate `trendOrder` and show divider + narratives for each trend
- If all narratives for a trend are classified, the trend doesn't appear in main grid

### Classifieds Threshold

```ts
const maxViews = orderedNarratives[0]?.viewCount ?? 0;
const classifiedThreshold = maxViews > 0 ? maxViews * 0.15 : 0;

const classifiedIds = new Set(
  orderedNarratives
    .slice(1) // Skip hero
    .filter(n => n.viewCount !== undefined && classifiedThreshold > 0 && n.viewCount < classifiedThreshold)
    .map(n => n.id)
);
```

**Why 15%?** It's aggressive enough to catch genuinely low-engagement stories but not so harsh that a slow week suddenly classifies everything.

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

4. **Test keyboard navigation:**
   - Click on tabs area, then use ArrowLeft/ArrowRight to navigate between tabs

5. **Test video caching:**
   - Load Video Feed tab (first load fetches data)
   - Switch to another tab, then back to Video Feed (should use cached data, no re-fetch)
   - Refresh page (should re-fetch)

6. **Build:** `npm run build` — no TypeScript errors

---

## Future Enhancements

- **Smart narrative ordering within trends**: Sort by viewCount desc within each trend group (currently uses global order)
- **Configurable threshold**: Make the 15% multiplier editable via settings
- **Multi-trend narratives**: If a narrative belongs to multiple trends equally, consider showing it once per trend or using a "trending across N topics" badge
- **Scrollable trend groups**: Collapsible trend sections if the page gets too long with many trends
- **Keyboard shortcut to refresh**: Quick way to refresh video feed without page reload

---

## Notes for Future Developers

- **Primary trend selection:** Narratives use `trendIds[0]` (first trend) as primary. If your backend changes how trends are ordered, update the grouping logic accordingly.
- **Classified items are excluded early:** The classifieds filter happens at the component level, not in the adapter. This keeps data transformation clean but means any future caching logic needs to handle this.
- **Rule dividers use CSS Grid:** The `gridColumn: '1 / -1'` spans full width. If you change the grid structure, test divider spanning.
- **Drop cap sizing:** Currently 3.2rem with 2px right margin for tight text wrap. Adjust if typography changes.
- **Tab scrolling removed:** Changed `overflow-x: auto` to `overflow-x: hidden` to prevent horizontal scrollbar on tab overflow. If tabs need scrolling in the future, revert this and properly hide the scrollbar with CSS
