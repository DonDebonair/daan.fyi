# Verification tooling

Scripts used to produce and check the Phase 0 baseline. Kept in the repo because
**Phase 8 needs to re-run the same capture against the Astro build** — a screenshot diff
is only meaningful if both sides were captured identically, and these encode a few
non-obvious workarounds.

Requires `playwright` (not a project dependency — install ad hoc):

```bash
npm i -D playwright && npx playwright install chromium
```

## `capture-screenshots.mjs`

Captures 13 pages × light/dark, full-page, 2× DPI.

```bash
ORIGIN=http://localhost:3000 OUT=/Users/daan/code/baseline/screenshots node capture-screenshots.mjs
# Phase 8: point ORIGIN at the Astro preview and OUT at a candidate/ dir, then compare
```

Three things it handles that a naive screenshot script gets wrong:

1. **Dark mode** is set by seeding `localStorage` before load _and_ `colorScheme` on the
   browser context. ✅ Both keys are now seeded: the Next baseline reads Chakra's
   `chakra-ui-color-mode`, the Astro port writes `color-mode`. Seeding only the old key
   would appear to work against the port too — it still reads that key as a fallback —
   which is why this was worth fixing before Phase 8 rather than after a confusing diff.
2. **Lazy images.** `next/image` lazy-loads below the fold, and a `fullPage` screenshot
   does not trigger it. Scrolling alone is also insufficient: at 60 fps the
   `IntersectionObserver` never fires for intermediate positions. The script forces every
   image `loading="eager"`, re-kicks incomplete `src`s, then scrolls with real delays.
3. **Fonts** are awaited via `document.fonts.ready` so text metrics don't shift between
   runs.

It writes a `manifest.json` recording per-capture body background and image load counts,
and warns if light and dark produced the same background — which means the theme toggle
silently failed.

## `compare-feeds.mjs`

Diffs the JSON feed against the baseline: item counts, title equality, stripped-text word
counts, first point of textual divergence, and per-tag count deltas. This is what
surfaced the double-title-casing bug and confirmed `rehype-autolink-headings` was
responsible for the `<a>` count gap.

Edit the `OLD` / `NEW` paths at the top before running.

## `compare-content.mjs`

Batch-compares every content file's rendered output against `../../../baseline/html/`.
Written for Phase 4 and reusable in Phase 8.

```bash
node compare-content.mjs      # edit BASE / CAND at the top if paths differ
```

Checks two things across all 33 documents:

1. **Heading ids** — the strongest single signal available. One string encodes
   title-casing, the acronym exceptions, the `remark-capitalize` trim quirk and the
   slugger all at once, so a regression in any of them shows up as a changed id.
2. **Typographic characters** — counts all 14 (curly quotes, em/en dashes, ellipses,
   arrows, `×`, `±`, `©`, `®`, `™`) per document.

It expects `CAND` to point at bare-content pages, which is what
`src/pages/check/[collection]/[slug].astro` produced in Phase 4. Once that route is
deleted in Phase 6, point it at the real pages — page chrome adds headings, so compare
ids by set membership rather than by index (which is what it already does).

## `gfm-scan.mjs`

Scans `content/` for GFM-sensitive syntax (tables, strikethrough, footnotes, task lists,
autolink-able bare URLs) after stripping code fences, inline code, existing markdown
links and raw HTML — so it reports real hits rather than false positives. This produced
the verified blast radius for the GFM decision. Re-run it if content changes before the
port lands.
