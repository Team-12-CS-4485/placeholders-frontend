# Claims Column Cap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap each column in the Classifieds view at 5 claims by default, showing the highest-risk ones first, with a per-column toggle to reveal the rest.

**Architecture:** Claims are already sorted by `riskScore` descending before rendering, so slicing to 5 naturally keeps the highest-value claims visible. A `Set<string>` tracks which columns the reader has expanded. The toggle button renders only when a column has more than 5 claims, and shows the remaining count so the reader knows what they're skipping.

**Tech Stack:** React 19, TypeScript 5.9, inline styles (no CSS framework)

---

## File Map

| File | Change |
|------|--------|
| `placeholders-frontend/src/components/views/Claims.tsx` | Add `CLAIMS_PER_COLUMN` constant, `expandedCols` state, slice logic, and toggle button |

No new files. No test files — this is pure UI interaction state with no extractable business logic; the existing 70 Vitest tests cover the data layer and are unaffected.

---

## Task 1: Add cap constant and per-column expanded state

**Files:**
- Modify: `placeholders-frontend/src/components/views/Claims.tsx`

The constant lives at module level (above the component) so it reads like configuration. The state uses the literal union type from `CLAIM_COLUMNS` so TypeScript catches any typo.

- [ ] **Step 1: Add the cap constant above the `Claims` component**

Current code around line 106 (the `export const Claims` line). Add the constant immediately above it:

```tsx
const CLAIMS_PER_COLUMN = 5;

export const Claims: React.FC<ClaimsProps> = ({
```

- [ ] **Step 2: Add `expandedCols` state inside the `Claims` component**

Add after the existing state declarations (after `const [isLoading, setIsLoading] = useState(true);`, around line 109):

```tsx
  const [expandedCols, setExpandedCols] = useState<Set<'consensus' | 'debated' | 'unique'>>(new Set());
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd placeholders-frontend
npm run build
```

Expected: no new errors. The `Set` generic matches the `type` field already used on `CLAIM_COLUMNS`.

---

## Task 2: Slice claims and render the toggle button

**Files:**
- Modify: `placeholders-frontend/src/components/views/Claims.tsx` (the `CLAIM_COLUMNS.map` render block, currently lines 238–285)

- [ ] **Step 1: Replace the column render block**

Find this block (starts at `{CLAIM_COLUMNS.map((col, colIdx) => {`):

```tsx
          {CLAIM_COLUMNS.map((col, colIdx) => {
            const colClaims = allClaims
              .filter(c => c.claimType === col.type)
              .sort((a, b) => b.riskScore - a.riskScore);
            return (
              <div key={col.type} className={`col-span-4${colIdx > 0 ? ' vertical-divider' : ''}`}>
                <div
                  style={{
                    backgroundColor: 'var(--ink-heavy)',
                    color: 'white',
                    padding: '8px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      color: 'white',
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: '0.85rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {col.label}
                  </h3>
                </div>

                {colClaims.length === 0 && (
                  <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>
                    No {col.label.toLowerCase()} claims this week.
                  </p>
                )}

                {colClaims.map((claim, idx) => (
                  <div
                    key={claim.id}
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: idx < colClaims.length - 1 ? '1px solid var(--ink-heavy)' : 'none',
                    }}
                  >
                    <ClaimEntry claim={claim} />
                  </div>
                ))}
              </div>
            );
          })}
```

Replace it with:

```tsx
          {CLAIM_COLUMNS.map((col, colIdx) => {
            const colClaims = allClaims
              .filter(c => c.claimType === col.type)
              .sort((a, b) => b.riskScore - a.riskScore);
            const isExpanded = expandedCols.has(col.type);
            const visibleClaims = isExpanded ? colClaims : colClaims.slice(0, CLAIMS_PER_COLUMN);
            const hiddenCount = colClaims.length - visibleClaims.length;

            return (
              <div key={col.type} className={`col-span-4${colIdx > 0 ? ' vertical-divider' : ''}`}>
                <div
                  style={{
                    backgroundColor: 'var(--ink-heavy)',
                    color: 'white',
                    padding: '8px 16px',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      color: 'white',
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: '0.85rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {col.label}
                  </h3>
                </div>

                {colClaims.length === 0 && (
                  <p className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--ink-faded)' }}>
                    No {col.label.toLowerCase()} claims this week.
                  </p>
                )}

                {visibleClaims.map((claim, idx) => (
                  <div
                    key={claim.id}
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '20px',
                      borderBottom: idx < visibleClaims.length - 1 || hiddenCount > 0 ? '1px solid var(--ink-heavy)' : 'none',
                    }}
                  >
                    <ClaimEntry claim={claim} />
                  </div>
                ))}

                {colClaims.length > CLAIMS_PER_COLUMN && (
                  <button
                    onClick={() =>
                      setExpandedCols(prev => {
                        const next = new Set(prev);
                        if (next.has(col.type)) next.delete(col.type);
                        else next.add(col.type);
                        return next;
                      })
                    }
                    className="font-mono"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      color: 'var(--ink-faded)',
                      padding: '4px 0 0 0',
                      textDecoration: 'underline',
                      display: 'block',
                    }}
                  >
                    {isExpanded ? 'Show less' : `+${hiddenCount} more claims`}
                  </button>
                )}
              </div>
            );
          })}
```

**Key decisions baked into this code:**
- `borderBottom` on the last visible claim is kept when there are hidden claims below it — the divider visually signals "more exists" without extra UI.
- `hiddenCount` is derived from `colClaims.length - visibleClaims.length` so it's always accurate regardless of cap value.
- Each column expands/collapses independently — a reader can open Debated without opening Consensus.
- The toggle text uses "Show less" / "+N more claims" to match the pattern already used in `NarrativeDetail.tsx`.

- [ ] **Step 2: Verify build and lint pass**

```bash
cd placeholders-frontend
npm run build
npm run lint
```

Expected: zero errors, zero new warnings.

- [ ] **Step 3: Smoke-test in browser**

```bash
npm run dev
```

1. Navigate to the **The Classifieds** tab.
2. Confirm each column shows at most 5 claims on load.
3. If a column has > 5 claims, confirm the `+N more claims` button appears below the last visible claim.
4. Click the button — confirm all claims expand.
5. Click `Show less` — confirm it collapses back to 5.
6. Change the week via the week picker — confirm all columns reset to collapsed (state lives in the component so it resets on re-render from `selectedWeekId` change).

- [ ] **Step 4: Commit**

```bash
git add placeholders-frontend/src/components/views/Claims.tsx
git commit -m "feat: cap classifieds columns at 5 claims with per-column show-more toggle"
```

---

## Self-Review

**Spec coverage:**
- ✅ Cap at ~5 per column → `CLAIMS_PER_COLUMN = 5`, sliced to `visibleClaims`
- ✅ Retain highest-value claims → claims already sorted by `riskScore` desc before slicing
- ✅ Signal more exist → `+N more claims` button with exact count
- ✅ Reader can expand → per-column toggle via `expandedCols` Set

**Placeholder scan:** None found.

**Type consistency:** `col.type` is `'consensus' | 'debated' | 'unique'` throughout; `expandedCols` is typed to match.
