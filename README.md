# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# placeholders
CS 4485 Senior Project 

## Static snapshot demo mode (backend-free)

This frontend supports an archived **read-only** mode for demos when the backend is offline.

### Run in static mode

```bash
VITE_DEMO_STATIC_MODE=true npm run dev
```

Build-time usage:

```bash
VITE_DEMO_STATIC_MODE=true npm run build
```

### Snapshot data location

Static snapshot payloads are in:

- `/home/runner/work/placeholders-frontend/placeholders-frontend/src/data/staticSnapshot.ts`

The API layer (`/home/runner/work/placeholders-frontend/placeholders-frontend/src/services/api.ts`) routes normal frontend endpoint calls to that local snapshot when static mode is enabled.

### How to refresh/replace snapshot data

1. Update objects in `src/data/staticSnapshot.ts` so they match backend endpoint shapes (`/api/weeks`, `/api/weeks/{week}`, `/api/trends`, `/api/trends/{id}`, `/api/narratives`, `/api/narratives/{id}/claims`, `/api/videos`, `/api/videos/by-id`, `/api/articles`, `/api/articles/{id}`).
2. Keep IDs consistent across related entities (cluster IDs, week IDs, video IDs, article IDs).
3. Update `STATIC_SNAPSHOT_DATE` when replacing the dataset.

### Data recovery notes

Snapshot values were adapted from committed backend test fixtures in:

- `Team-12-CS-4485/placeholders-backend/tests/api/test_narratives.py`
- `Team-12-CS-4485/placeholders-backend/tests/api/test_trends.py`
- `Team-12-CS-4485/placeholders-backend/tests/api/test_videos.py`
- `Team-12-CS-4485/placeholders-backend/tests/api/test_stats_and_articles.py`

and supplemented with frontend adapter fixture conventions in:

- `/home/runner/work/placeholders-frontend/placeholders-frontend/src/lib/adapters.test.ts`

### Known limitations in static mode

- Data is fixed and does not update from live systems.
- The app is explicitly read-only in static mode.
- Backend-only capabilities (real-time freshness, live pagination continuity beyond the local snapshot) are limited to the embedded dataset.
