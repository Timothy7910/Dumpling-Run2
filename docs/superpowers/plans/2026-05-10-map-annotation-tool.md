# Map Annotation Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual 32-cell map annotation tool and let the game use annotated coordinates.

**Architecture:** A shared browser/CommonJS `track-data.js` module owns the default track, validation, and localStorage parsing. The game reads coordinates through that module, while `map-editor.html` writes the same schema into localStorage and exports JSON for backup.

**Tech Stack:** Plain HTML, CSS, JavaScript, Node `node:test`.

---

### Task 1: Track Data Module

**Files:**
- Create: `track-data.js`
- Create: `tests/track-data.test.cjs`
- Modify: `index.html`
- Modify: `game.js`

- [ ] Write tests that require `track-data.js`, validate exactly 32 numbered points, validate special cells, and parse saved JSON.
- [ ] Run `node --test tests/track-data.test.cjs` and confirm it fails because `track-data.js` does not exist.
- [ ] Implement `track-data.js` with defaults, validation, and localStorage-safe loading.
- [ ] Wire `index.html` to load `track-data.js` before `game.js`.
- [ ] Replace hard-coded sets and `cellPoint()` defaults in `game.js` with `window.DangoTrack`.

### Task 2: Manual Editor

**Files:**
- Create: `map-editor.html`
- Modify: `styles.css`
- Copy asset: `public/maps/reference-map.png`

- [ ] Build an editor page that displays the screenshot, lets the user click 32 cells in order, and cycles selected cell type between normal, advance, block, time, and finish.
- [ ] Add controls for undo, clear, save/apply to localStorage, export JSON, and copy JSON.
- [ ] Use compact controls and clear labels so the map remains the main surface.

### Task 3: Verification

**Files:**
- Existing project files only.

- [ ] Run `node --test tests/track-data.test.cjs`.
- [ ] Run `npm run build`.
- [ ] Start `node server.js` if needed and verify `index.html` and `map-editor.html` load in the browser.
