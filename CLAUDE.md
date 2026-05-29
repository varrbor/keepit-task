# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at localhost:3000
npm test         # Jest in watch mode
npm run build    # production build
npm run lint     # ESLint
npm run lint:fix # ESLint with auto-fix
npm run format   # Prettier
```

ESLint is disabled during `start`, `build`, and `test` via `DISABLE_ESLINT_PLUGIN=true`.

## Architecture

A Create React App (React 18, plain JS) file-tree manager with no backend or routing.

### State model

`App` holds two parallel state arrays:

- `entities` — the currently rendered tree (may be filtered/hidden)
- `cache` — the canonical source of truth; always reflects all items regardless of active filters

Both must be updated together on create/delete/rename so that toggling the "show folders only" checkbox or changing the date filter restores the full tree correctly.

### Data shape

Each node is a plain object:

```js
{ id: Date.now(), type: 'dir' | 'file', name: string, subCategories: [] }
```

`id` is a Unix timestamp, which is also used for date-based filtering (`id < startDate`).

### Tree operations (`src/utils/utils.js`)

All mutations are pure recursive functions that return a new tree — no in-place mutation. Patterns:

- Each exported function checks the top-level array first, then delegates to a `*Recursion` helper that walks `subCategories`.
- `hideCategory` filters by type; when unchecking it restores from `cache` via `updateStateRecursion` (a deep clone).
- `filterCategory` filters nodes whose `id` (timestamp) is older than `startDate`.

### Component structure

`Entry` (`src/components/Entry/Entry.js`) is a recursive component. It renders a folder or file row, and when expanded maps over `entry.subCategories` rendering more `Entry` instances with `depth + 1` for left-padding.
