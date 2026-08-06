# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`daan.fyi` — Daan Debie's personal site. Astro 7 + TypeScript + Tailwind 4, content authored in MDX, statically generated, deployed on Vercel.

It was migrated from Next.js 14 (Pages Router) + Chakra UI. `MIGRATION.md` is the full record of that migration — read it before changing anything about styling, the Markdown pipeline, or URLs, because much of what looks arbitrary is a deliberate reproduction of the old behaviour and is documented there.

## Commands

```bash
npm install
npm run dev          # dev server
npm run build        # production build into dist/
npm run preview      # serve the production build
npm run type-check   # astro check — types across .astro and .ts. This is the gate.
npm run prettier     # format everything in place
```

Use **npm, not yarn** — `engines.yarn` is deliberately set to an error string.

There is no test suite and no ESLint. `type-check` is the verification step; Prettier handles formatting. A husky `pre-commit` hook runs `lint-staged` (Prettier only).

## Content model

All content lives in `src/content/<collection>/<slug>.mdx`; the filename _is_ the slug. Collections are declared in `src/content.config.ts` with a Zod schema:

- `writings/` — current blog posts, served at `/writings/[slug]`. Legacy `/blog/:slug` redirects here (`vercel.json`).
- `archive/` — old posts kept for permalink stability, served at `/archive/[slug]`. No topics, no series.
- `special/` — non-post MDX. `_kitchensink.mdx` is the styling test page at `/_kitchensink`.

Frontmatter: `title`, `publishedAt`, optional `summary`, `topics` (string array), `series`.

`publishedAt` is validated as a **string** (`YYYY-MM-DD`), not coerced to a Date — the raw string is what `article:published_time` and the feeds emit.

**Two gotchas that will cost you an afternoon:**

1. **The `glob()` loader skips underscore-prefixed files by default**, which is why the `special` collection asks for `**/_*.mdx` explicitly. Without it `_kitchensink.mdx` silently disappears.
2. **Astro also refuses to route any file under `src/pages` whose name starts with `_`.** That is why `/_kitchensink` is emitted from the root catch-all `src/pages/[topic].astro` rather than from a page of its own. The exclusion applies to filenames, not to param values.

**Series**: posts sharing a `series` value are grouped by `getSeriesData` in `src/lib/posts.ts`; `SeriesOverview.astro` renders the box.

**Topics**: derived entirely from post frontmatter by `src/lib/topics.ts`. Topic pages are served from the **root-level catch-all `src/pages/[topic].astro`**, i.e. `/mental-health`. Astro prioritises static routes over dynamic ones, so a topic named `about`, `topics`, `writings`, `archive` or `404` would be shadowed by that page — pick topic slugs accordingly.

## MDX pipeline

Configured in `astro.config.mjs` under `markdown`. Astro 7 made the Markdown engine pluggable: `gfm`, `smartypants`, `remarkPlugins`, `rehypePlugins` and `remarkRehype` are **deprecated at the `markdown` level** and belong on `markdown.processor: unified({...})`. `shikiConfig` and `syntaxHighlight` stay at the `markdown` level.

Plugin order is load-bearing:

- **remark**: `remark-unwrap-images` → `remark-title-case` (in-repo, `src/plugins/`) → `remark-textr` with the twelve `typographic-*` plugins.
- **rehype**: `rehypeHeadingIds` → `rehype-autolink-headings`. `rehypeHeadingIds` **must be listed explicitly**; Astro otherwise injects it after user plugins and `rehype-autolink-headings` silently emits no anchors.

`markdown.smartypants` is off: it fights `remark-textr` (en dash vs em dash, and it curls quotes that should stay straight). GFM is on.

Syntax highlighting is **Shiki** with two hand-ported themes in `src/shiki/` (Prism's default palette for light, Night Owl with three `#FFA7C4` overrides for dark). `defaultColor: false` emits `--shiki-light`/`--shiki-dark` per span, and `src/styles/article.css` selects between them.

⚠️ **Set the Shiki background on the block, never on the token spans.** `--shiki-*-bg` is set on the `<pre>` and inherits, so `.astro-code span { background }` makes every token paint an opaque rectangle over the highlighted-line band.

Code fences use standard Shiki syntax: ` ```python {4,5,8} ` for line highlighting and ` ```ts title="file.ts" ` for a title (rendered by `src/plugins/transformer-code-title.mjs`). `langAlias` maps `apacheconf` → `apache`; without it Shiki falls back to plaintext without warning.

## Images

MDX images live in **`src/assets/`** and are referenced relatively (`../../assets/foo.png`), so Astro optimises them to WebP with intrinsic dimensions and `loading="lazy"`.

Files in `public/` are served verbatim and must stay there when the URL matters:

- `public/images/banner.png` — the default OG/Twitter image, referenced by absolute URL.
- `public/images/daan.png` — the article avatar.
- `public/archive-assets/files/**` — four PDF/xlsx download links in archive posts.
- `public/archive-assets/images/{hadoop-bigdata-applications.png,blockchain.jpg}` — these are **link targets**, not images, so Astro never rewrites them.

## Styling

Tailwind 4, configured entirely in `src/styles/global.css` — there is no `tailwind.config.js`.

- **Semantic tokens only.** Every colour is a `--ui-*` custom property declared in `:root` and flipped in `.dark`, exposed to Tailwind with `@theme inline`. Tailwind's default palette is **removed** (`--color-*: initial`), because its `gray-800` is not Chakra's `gray.800` and a stray `bg-gray-800` would be silently wrong. Need a new colour? Add a role.
- **Breakpoints are Chakra's, not Tailwind's** — `sm` is 30em, not 40rem. The NavBar collapses at `sm`.
- **The font-size scale is cleared and redefined**, because Tailwind pairs every size with a line-height and this design sets line-height from the cascade. Note `sm` is a deliberate `0.89rem`.
- Root font size is **18px**. Every rem in the design, including Tailwind's spacing scale, is measured against it.
- `.heading` carries `line-height: 1.33` (1.2 above 48em) because Chakra's `<Heading>` defaulted to `size="xl"`. The size modifiers set font-size only.
- The `@layer base` block reproduces Chakra's CSS reset where Tailwind's Preflight is smaller — notably `-webkit-font-smoothing: antialiased`, without which dark-mode text renders visibly heavier on macOS.

Prose styling is plain CSS in `src/styles/article.css`, using descendant selectors on `.article`. No `@tailwindcss/typography`, no `@apply`.

⚠️ **`.article` is a flex column, deliberately.** Flex items do not collapse margins, which is what the Chakra layout relied on. As a plain block container every adjacent block boundary loses ~9px — around 800px over a long article. Anything that must span the column (`hr`, `pre`, `table`, `.code-title-wrapper`, `.footnotes`) sets `width: 100%` for the same reason.

**Colour mode** follows the OS by default; a manual toggle overrides it and persists to `localStorage` under `color-mode` (Chakra's old `chakra-ui-color-mode` is read as a fallback). `src/components/ColorModeScript.astro` is `is:inline` and must stay that way — it has to run before first paint.

## Feeds, sitemap, redirects

- `src/pages/feeds/{feed.xml,atom.xml,feed.json}.ts` are real endpoints over a shared, memoised builder in `src/lib/feeds.ts`. It renders MDX with `experimental_AstroContainer`, which **requires registering the MDX renderer by hand** (`container.addServerRenderer`) — without it you get a confusing "Expected component X to be defined".
- ⚠️ `experimental_AstroContainer` is experimental. **The Astro version is pinned for this reason** — check the feeds after any Astro upgrade.
- `src/pages/sitemap.xml.ts` emits the sitemap index at the legacy URL. `@astrojs/sitemap` generates `sitemap-0.xml` but names its index `sitemap-index.xml`, and `filenameBase` renames both together, so it cannot reproduce the original pair.
- `src/pages/robots.txt.ts` carries the non-production `Disallow: /` policy, keyed off `VERCEL_ENV || NODE_ENV`.
- `vercel.json` holds the `/blog/:slug` → `/writings/:slug` redirect. Astro's config `redirects` would emit meta-refresh HTML in a static build, not a real 308.

## URLs

`trailingSlash: 'never'` + `build.format: 'file'`. Canonical URLs carry **no trailing slash** and no extension.

⚠️ **`Astro.url.pathname` is the emitted file path**, so it reads `/about.html` at build time. `src/components/Meta.astro` strips the extension before building canonical and `og:url` — without that every page publishes a canonical URL that is not the one served.

## Verification tooling

`tools/` holds the scripts used to verify the migration against the pre-migration baseline: URL/heading/typography comparison, feed comparison, and a screenshot pixel-diff. They are not part of the build and need `playwright` installed ad hoc. See `tools/README.md`. Useful for any future change that should not alter rendered output.

## Conventions

- Path aliases: `@/components/*`, `@/lib/*`, `@/layouts/*` → `src/*`.
- Prettier: 4-space indent, single quotes (double in JSX), 100 columns, ES5 trailing commas. `src/content/` is deliberately **not** formatted.
- TypeScript is strict (`astro/tsconfigs/strict`). Untyped dependencies are declared in `src/types/untyped-modules.d.ts` rather than silenced with `@ts-ignore`.
- Everything is statically generated. There are no API routes and no client-side data fetching; the only JavaScript shipped is two small inline scripts (colour mode, nav toggle).
