# Code Maturity — Current State & Future Work

This document captures where the frontend stands today in terms of engineering quality, and what gaps remain for any developer picking this up. Each section describes what exists, what's missing, and the honest tradeoffs for addressing it.

Last audited: April 2026.

---

## What's in good shape

**TypeScript** — Full strict mode is on. `strict: true`, `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedSideEffectImports` are all enabled in `tsconfig.app.json`. The type layer is not soft — unused variables are compile errors, not warnings.

**Linting** — ESLint 9 with `typescript-eslint`, `react-hooks`, and `react-refresh` rule sets. One pre-existing warning in `Videos.tsx` (missing `useEffect` dependency). Zero errors.

**Business logic tests** — 70 tests across `adapters.test.ts`, `search.test.ts`, and `weekUtils.test.ts` using Vitest. The data transformation layer (adapters, search, date utils) is well covered. These tests run fast and protect the most change-sensitive layer of the app.

**CI pipeline** — GitHub Actions runs lint → test → build on every PR and push to main. Configured with concurrency cancellation so duplicate runs don't pile up.

**Bundle size** — 263 KB JS / 80 KB gzip, single chunk. Reasonable for this stage.

**Environment hygiene** — No `.env` files checked in, no hardcoded secrets, `.gitignore` excludes all the right things.

---

## Gaps and their tradeoffs

### 1. Security advisory — postcss XSS (fix this first)

**What it is:** `postcss <8.5.10` has a known moderate XSS vulnerability in its CSS stringify output (unescaped `</style>` tags). It's a transitive build-time dependency — it runs during `npm run build`, not in the user's browser.

**Practical risk:** Low. Your users never run postcss. The risk is to the build environment. But it's a known CVE and `npm audit fix` resolves it in under a minute.

**Tradeoffs:** None. Fix it.

```bash
npm audit fix
```

✅ Task: Run `npm audit fix`

---

### 2. Error boundaries — missing entirely

**What they are:** React class components (or wrapper hooks in React 19) that catch errors thrown by any child component and render a fallback UI instead of crashing the entire app.

**What you get:** If `WeekReport` throws because a backend response came back in an unexpected shape, only that panel fails — not the whole app. Users see "Something went wrong" instead of a blank screen.

**Tradeoffs:** Almost none. A single error boundary wrapping `<main>` in `App.tsx` is about 15 lines of code, zero ongoing maintenance, and immediately improves resilience.

**Where to add it:** Wrap the `<main className="folder-content">` in `App.tsx` with a boundary component. A second, more granular boundary wrapping each tab's content gives finer-grained recovery.

**Suggested implementation:**

```tsx
// src/components/shared/ErrorBoundary.tsx
import React from 'react';

interface State { hasError: boolean }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p className="font-mono" style={{ color: 'var(--ink-faded)' }}>
            Something went wrong loading this section.
          </p>
          <button className="btn-link" onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### 3. Component / UI tests — not present

**What they cover:** That clicking "Read More" opens the right tab, that the archive list renders weeks correctly, that a missing `week_overview` doesn't blank the summary section. Behaviors that TypeScript types cannot verify because they're about interaction, not shape.

**The honest tradeoff:** Component tests in React are expensive to write and brittle to maintain. Testing a component that fetches data and renders conditionally requires mocking API calls, setting up a fake DOM (jsdom), and often rewriting tests when layout or copy changes. During the design-to-code phase — when component structure is still shifting — these tests rot quickly.

**When to write them:** Once the UI stabilizes. Good candidates when you get there:

- `WeekReport` — summary rendering, narrative ordering, classified section threshold logic
- `Archives` — week list rendering, narrative count display
- `FolderTabs` — open/close behavior, active state, parent-child tab relationships
- `App` — the `loadNarrativesForWeek` lifecycle (narrative fetch, summary rebuild, cache behavior)

**Testing stack already in place:** Vitest is installed. Add `@testing-library/react` and `@testing-library/user-event` to get started. A `jsdom` environment is the standard choice for component tests.

```bash
npm install -D @testing-library/react @testing-library/user-event jsdom
```

Then in `vitest.config.ts`, set `environment: 'jsdom'` for component test files.

---

### 4. Code splitting — single chunk, no lazy loading

**What the build does today:** Ships one 263 KB JS bundle. Every byte of every view (WeekReport, Trends, TrendDetail, NarrativeDetail, Videos, Archives, Claims) loads on initial page visit, whether the user ever opens those tabs or not.

**The build warning you're already seeing:**

```
src/lib/adapters.ts is dynamically imported by VideoDetail.tsx but also 
statically imported by App.tsx, Claims.tsx, NarrativeDetail.tsx, TrendDetail.tsx, Videos.tsx
— dynamic import will not move module into another chunk.
```

This means `VideoDetail.tsx` is trying to lazy-load `adapters.ts` but can't because everything else imports it statically. The chunk splitting fails silently.

**What you get from fixing it:** Faster initial render. Users load the shell and the current week's view, then fetch code for Trends/Archives/Videos only when they navigate there. On slow connections or mobile this is meaningful.

**The tradeoff:** Requires restructuring the import graph. `adapters.ts` needs to stay statically imported in `App.tsx` (it's used at init time). The fix for `VideoDetail.tsx` is to remove its dynamic import of adapters and instead receive adapted data via props or context — or to accept that adapters can't be split and remove the dynamic import entirely to clear the warning.

Full route-based code splitting then looks like:

```tsx
// In App.tsx
const TrendDetail = React.lazy(() => import('./components/views/TrendDetail'));
const NarrativeDetail = React.lazy(() => import('./components/views/NarrativeDetail'));
// etc.
```

Each lazy component needs a `<Suspense fallback={...}>` wrapper. Combined with an error boundary, this gives you both graceful loading and graceful failure.

**Recommended order:** Fix the `VideoDetail.tsx` dynamic import issue first (it's a structural smell with no benefit as-is), then decide whether full lazy loading is worth the Suspense plumbing.

---

### 5. CI coverage reporting — not configured

**What's missing:** The CI pipeline runs tests but doesn't collect or report coverage numbers. There's no threshold gate (e.g., "fail the build if coverage drops below 70%") and no artifact uploaded for review.

**What you get:** A coverage gate prevents regressions — if someone deletes tests or ships a new adapter without tests, CI catches it. A coverage report in CI gives reviewers a signal during PR review.

**The tradeoff:** Coverage percentages are a proxy metric. A project can have 95% coverage and still have the wrong behavior if tests assert on the wrong things. Enforcing a threshold also creates incentive to write low-value tests just to pass the gate. Use it as a signal, not a hard rule.

**How to add it:** Vitest has built-in coverage via `@vitest/coverage-v8`.

```bash
npm install -D @vitest/coverage-v8
```

In `vitest.config.ts`:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov'],
  include: ['src/lib/**'],   // focus on the business logic layer
  thresholds: {
    lines: 80,
    functions: 80,
  },
}
```

In `.github/workflows/ci.yml`, change the test step to:

```yaml
- run: npm run test -- --coverage
```

And optionally upload the `lcov` report to Codecov or similar for PR annotations.

---

## Priority order

| Priority | Item | Effort | Value |
|----------|------|--------|-------|
| 1 | Fix postcss advisory | 1 min | Removes known CVE |
| 2 | Add error boundary | 30 min | High resilience gain, zero maintenance cost |
| 3 | Fix adapters.ts dynamic import | 1 hr | Clears build warning, unblocks future splitting |
| 4 | CI coverage reporting | 2 hrs | Prevents test regression over time |
| 5 | Route-based code splitting | 4-8 hrs | Load time improvement, meaningful at scale |
| 6 | Component / UI tests | Ongoing | Write after UI stabilizes |
