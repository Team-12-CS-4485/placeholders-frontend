# Frontend Documentation

This folder documents major frontend features, architectural decisions, and
implementation guides for the placeholders-frontend React app.

## Available Docs

### [narrative_trend_grouping.md](./narrative_trend_grouping.md)

Explains the narrative trend grouping system, where stories are organized by
their primary trend with decorative dividers. Includes:

- How narratives are grouped by trend
- Relative engagement-based classifieds threshold (15% of max)
- Dynamic bylines showing engagement volume, claim count, and breaking status
- Drop caps on all narrative summaries
- Testing procedures and future enhancement ideas

**Latest updates:** Narratives now group by trend with smart dividers that don't
appear for low-engagement classifications. Bylines show real engagement data
instead of generic bureau/date labels.

---

## Architecture Overview

The WeekReport component (`src/components/views/WeekReport.tsx`) is the heart
of the front page:

1. **Data flow:** Backend sends week data → adapters normalize → component
   groups and renders
2. **Grouping:** Narratives are grouped by `trendIds[0]` (primary trend)
3. **Filtering:** Classified narratives (low engagement) are separated into
   their own grid
4. **Rendering:** Trend dividers appear only for main-grid trends, preventing
   empty section dividers

---

## Key Files

- **`src/components/views/WeekReport.tsx`** — Main weekly report page with
  trend grouping
- **`src/lib/adapters.ts`** — Data normalization (maps backend responses to
  Narrative interface)
- **`src/types/index.ts`** — TypeScript interfaces including Narrative, Trend,
  WeekData
- **`src/index.css`** — Global styles including newspaper charm, drop caps,
  rule dividers

---

## Contributing

When adding new frontend features:

1. Add comprehensive docs to this folder explaining the "why" and "how"
2. Reference file paths and line numbers for easy navigation
3. Include testing procedures so future developers can validate the feature
4. Think about edge cases and document them
5. Consider future enhancements in a "Future Work" section

See `narrative_trend_grouping.md` for documentation style and level of detail.
