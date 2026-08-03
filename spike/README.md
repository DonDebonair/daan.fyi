# Phase 1 spike artifacts

Working code produced by the two de-risk spikes in [`../MIGRATION.md`](../MIGRATION.md).
All of it was **verified against real content** — this is not sketch code, it is the
proven configuration waiting to be moved into place.

Committed here rather than left in a scratch directory because re-deriving the Shiki
scope mappings is the tedious part, and it has already been done once correctly.

## Where each file lands

| File                                 | Phase | Destination                                          |
| ------------------------------------ | ----- | ---------------------------------------------------- |
| `astro.config.mjs`                   | 2 / 4 | repo root — merge into the real config               |
| `shiki/prism-default-light.json`     | 4     | `src/shiki/`                                         |
| `shiki/night-owl-pink.json`          | 4     | `src/shiki/`                                         |
| `plugins/transformer-code-title.mjs` | 4     | `src/plugins/`                                       |
| `feeds/feed.xml.ts`                  | 7     | `src/pages/feeds/` — split into rss/atom/json routes |
| `screenshots/`                       | 8     | reference only, not shipped                          |

## What each proves

**`feeds/feed.xml.ts`** — the Container API renders content-collection entries including
custom components. The non-obvious part is `container.addServerRenderer({ name: '@astrojs/mdx', renderer: mdxRenderer })`; without it the render fails with a confusing
"Expected component X to be defined" error. Custom components go in via the `components`
prop, exactly as the MDX sources expect today.

⚠️ `experimental_AstroContainer` is experimental. Verified on **astro@7.1.6** — pin it.

**`shiki/*.json`** — the two hand-ported themes. Light is Prism's default palette
(`#905` / `#690` / `#07a` / `#dd4a68` / `#999` / slategray). Dark is Night Owl with
`keyword`, `tag` and `operator` overridden to `#ffa7c4`.

Both carry a `_comment` on the `variable` rule explaining why its scope is deliberately
narrow: mapping TextMate's `variable` to Prism's `.token.variable` colour painted every
function parameter orange, because Prism leaves parameters untokenised while TextMate
scopes them `variable.parameter`. That is the general shape of the Prism→TextMate
taxonomy mismatch — expect a few more like it and check against `../../baseline/`.

**`astro.config.mjs`** — the settings that are easy to miss:

-   `gfm: false` and `smartypants: false`. Astro defaults **both** on. GFM would start
    rendering tables/footnotes/task-lists that are literal text today; smartypants
    conflicts with the `remark-textr` stack (en dash vs em dash).
-   `langAlias: { apacheconf: 'apache' }`. Prism accepted `apacheconf`; Shiki does not, and
    fails silently to plaintext.
-   `defaultColor: false` — emits `--shiki-light` / `--shiki-dark` per span so the whole
    light/dark mechanism is six lines of CSS instead of ~150 lines of paired `mode()`.

**`plugins/transformer-code-title.mjs`** — replaces `rehype-code-titles`, emitting the
same `.rehype-code-title` div. Reads `title="…"` from the fence meta, which is why the
five fence edits listed in Phase 4 are required.

An earlier version of the spike also had a `remark-normalize-code-meta.mjs` that parsed
the existing ` ```lang{1,2}:title ` syntax. It was **dropped**: editing the five fences
produces byte-identical output with one fewer moving part.

## Reproducing

Not runnable in place — these are fragments of a throwaway Astro project. To rebuild it:
`npm create astro@latest`, add `@astrojs/mdx` and `@shikijs/transformers`, copy these
files in, and point a content collection at `content/writings`.
