# Migration plan: Next.js + Chakra → Astro + Tailwind

**Goal:** identical URLs, identical content, visually identical styling. New stack.

**Sequencing principle:** de-risk the two genuinely uncertain things first, capture a
baseline you can diff against, then port mechanically. Nothing about this migration is
hard except feeds and syntax highlighting — do those before committing.

**Branch:** `feat/astro-rewrite`. `git mv` `content/` and `public/` rather than recreating
them, so history follows the files that matter.

---

## Ground rules

These are the things that must not change. Check them at every phase boundary.

| Invariant                                                                       | Why                                              |
| ------------------------------------------------------------------------------- | ------------------------------------------------ |
| All 61 pages resolve identically                                                | permalink stability is the stated goal           |
| **No trailing slash** — `/writings/rss/` 308s to `/writings/rss`                | verified in Phase 0; silent regression otherwise |
| `/blog/:slug` → `/writings/:slug` returns **308** (not 301)                     | legacy inbound links                             |
| `/feeds/feed.xml`, `/atom.xml`, `/feed.json` exist and contain **rendered** MDX | subscribers                                      |
| `public/archive-assets/**` paths unchanged                                      | 10 archive posts reference them                  |
| Heading title-casing + typographic substitutions byte-identical                 | content rendering                                |
| **GFM stays off** (or the kitchen sink gets fixed deliberately)                 | see Phase 0 findings                             |

### URL inventory — 61 pages + 6 generated files

-   `/`, `/about`, `/topics`, `/writings`, `/archive`, `/_kitchensink` — 6
-   `/writings/{9 slugs}` — 9
-   `/archive/{23 slugs}` — 23
-   `/{23 topic slugs}` — 23
    `amplify aws editors hn iam ide infrastructure lgbtqi mental-health multi-account news nextjs opinions plugins pyenv python rss snippets sourceag syndication tooling typing website`
-   `/feeds/feed.xml`, `/feeds/atom.xml`, `/feeds/feed.json` — 3
-   `/sitemap.xml` (**an index**), `/sitemap-0.xml`, `/robots.txt` — 3

Full list in `../baseline/meta/urls.txt`.

> Note: `rss` is both a topic (`/rss`) and a post (`/writings/rss`). Different
> namespaces, no collision — but don't "fix" it.

### Feature coverage map (which post exercises what)

| Feature                          | Test page                                                |
| -------------------------------- | -------------------------------------------------------- |
| `SideNote`                       | `writings/mental-health`, `writings/iam`, `_kitchensink` |
| `Small`, `Asterisk`              | `_kitchensink`                                           |
| Series navigation                | `writings/aws-multi-account`, `writings/iam`             |
| Code line highlighting `{4,5,8}` | `writings/python-protocols`, `_kitchensink`              |
| Code titles `:filename`          | `writings/rss` (3×), `_kitchensink`                      |
| Images in MDX                    | `writings/aws-multi-account`, `_kitchensink`             |
| `archive-assets`                 | 10 archive posts                                         |
| Topic preamble                   | **none** — `content/topics/` doesn't exist yet           |

---

## Phase 0 — Baseline capture ✅ DONE

Captured at `../baseline/` (outside the repo, so it survives the cutover commit and
never enters git history). See `../baseline/README.md` for contents and the Phase 8
diff recipe.

-   [x] `npm run build && npm start` — builds clean on Node 26
-   [x] All **61 pages** fetched to `../baseline/html/`, all 200. URL list derived from
        `.next/server/pages` rather than by crawling — `/_kitchensink` is linked from
        nowhere and a link-following crawler misses it.
-   [x] Feeds copied to `../baseline/feeds/` — 9 items in each of the three formats
-   [x] Sitemap, `sitemap-0.xml`, robots captured
-   [x] Trailing-slash + redirect + 404 behaviour recorded in `meta/behaviour.txt`
-   [x] Checksums (`meta/html.sha256`, `meta/feeds.sha256`) and provenance recorded
-   [x] **26 screenshots** — 13 pages × light/dark, full-page, 2× DPI, in
        `../baseline/screenshots/`

### Findings that change the plan

1. **Canonical URLs have no trailing slash.** `/writings/rss/` → **308** →
   `/writings/rss`. Astro needs `trailingSlash: 'never'` + `build.format: 'file'`.
2. **The legacy redirect is a 308, not a 301** — Next's `permanent: true` emits 308.
   Match it in `vercel.json`; both are permanent for SEO, but don't downgrade it silently.
3. **`remark-gfm` is absent — and Astro enables GFM by default.** Today, tables,
   footnotes, task lists and strikethrough render as **literal text**: there is not a
   single `<table>` element anywhere in the built site. A naive port would silently start
   rendering all of it. Blast radius is limited — `_kitchensink.mdx` is the only file
   containing GFM syntax; no real post is affected. **Decision required** → `____`
    - Set `markdown.gfm: false` to match today exactly, **or**
    - Accept GFM and deliberately fix `_kitchensink.mdx`
    - Either way: `MDXComponents.tsx`'s `table`/`thead`/`tbody`/`tfoot`/`tr`/`th`/`td`/
      `caption` mappings and `styles/components.ts`'s `Table` baseStyle are **dead code**
      today. Don't port them without deciding this first.
4. **`sitemap.xml` is an index** pointing at `sitemap-0.xml`. Decide whether
   `@astrojs/sitemap` should reproduce the index or emit a single file.
5. **`SideNote` markup does survive into the current feeds** (verified: `aside` appears
   in `feed.xml`). This is exactly what Phase 1A must preserve — it is a real regression
   risk, not a hypothetical one.

### Local-only capture caveats (not site defects)

-   `robots.txt` says `Disallow: /` because `VERCEL_ENV` is unset locally. Production
    gets the real policy. Compare against the local baseline, not production.
-   `sharp` is not installed, so Next's image optimizer uses a slow fallback; the
    optimizer cache had to be warmed before screenshots captured images.
-   Screenshots force `loading="eager"` — `next/image` lazy-loads below the fold and
    neither full-page capture nor fast scrolling triggers the `IntersectionObserver`.
    Images are captured; lazy-load _behaviour_ is not.

**Exit criteria:** met — `../baseline/` holds all 61 pages, 3 feeds, 3 generated files,
26 screenshots, checksums and provenance.

---

## Phase 1 — De-risk spikes

Throwaway Astro project. Do not start the real migration until both resolve.
**If spike A fails, the plan changes** — so run it first.

### 1A. Feeds (the real risk)

`@astrojs/rss` explicitly does not process components in MDX. The documented fallback
(`markdown-it` over `post.body`) would silently drop `<SideNote>` from 3 posts.

-   [ ] Render one content-collection entry to an HTML string via
        `experimental_AstroContainer.renderToString()`, including a custom component
-   [ ] Confirm the `SideNote` markup appears in the output
-   [ ] Confirm the `feed` package (keep it — it's framework-agnostic and it's what gives
        you all three formats) can consume that string
-   [ ] Note the Astro version pinned; the Container API is **experimental** and can break
        in minor releases

**Fallback if this fails:** render each post to a hidden static route at build time and
read the HTML back off disk. Uglier, stable.

**Decision gate:** Container API, or build-and-read-back? Record the answer here → `____`

### 1B. Syntax highlighting

Your light theme is stock Prism default; your dark theme is Night Owl with
`keyword`/`tag`/`operator` overridden to `#ffa7c4`. Shiki bundles `night-owl`.

-   [ ] Write `shiki-light.json` (~20 scope entries, port from `styles/styles.ts` lines 74–148)
-   [ ] Write `shiki-dark.json` = `night-owl` + the three pink overrides
-   [ ] Configure `themes: { light, dark }` with `defaultColor: false`
-   [ ] Verify class-based dark toggle works via `--shiki-dark` CSS var override
-   [ ] Verify `transformerMetaHighlight` reads your existing `{4,5,8}` syntax unchanged
-   [ ] **Verify `rehype-code-titles` still fires** — it reads the meta string, and Astro's
        Shiki pass may strip it first. Plugin ordering risk. Fallback: ~20-line Shiki
        transformer reading raw meta.
-   [ ] Render a TS + Python block, compare against Phase 0 screenshots

**Fallback if fidelity is unacceptable:** `syntaxHighlight: 'prism'` and port
`styles/styles.ts` verbatim to plain CSS. One-line config change, zero visual delta.

**Decision gate:** Shiki, or keep Prism? Record → `____`

---

## Phase 2 — Scaffold

-   [ ] `npm create astro@latest` — minimal, TypeScript strict
-   [ ] `npx astro add mdx sitemap`
-   [ ] `npx astro add tailwind` (Tailwind 4 via `@tailwindcss/vite` — **not** `@astrojs/tailwind`)
-   [ ] Port path aliases to `tsconfig.json`: `@/components/*`, `@/lib/*`, `@/layouts/*`
-   [ ] `git mv content src/content`, `git mv public public` (stays put)
-   [ ] Port `lib/config.ts` verbatim (env-var-driven `baseUrl` still works on Vercel)
-   [ ] Prettier config: 4-space, single quotes, 100 cols, ES5 trailing commas
-   [ ] Husky + lint-staged
-   [ ] Set `trailingSlash: 'never'` + `build.format: 'file'` (confirmed in Phase 0:
        `/writings/rss/` 308s to `/writings/rss`)

**Exit criteria:** empty site builds, aliases resolve.

---

## Phase 3 — Design system (do this before any component)

The single highest-leverage step. Getting tokens right first means components are
mechanical; retrofitting them later is miserable.

-   [ ] Extract the 26 Chakra colour values to hex. Full list:
        `blue.100 blue.600 cyan.600 gray.50 gray.100 gray.200 gray.600 gray.700 gray.800 gray.900 green.200 green.700 red.200 red.700 teal.200 teal.300 teal.400 teal.500 teal.800 teal.900 whiteAlpha.800 whiteAlpha.900 yellow.200 yellow.300 yellow.700`
-   [ ] Define **semantic** tokens as CSS custom properties in `:root`, flipped in `.dark`
        (`--color-surface`, `--color-accent`, `--color-rule`, …). Do _not_ translate each
        `useColorModeValue` to `bg-white dark:bg-gray-900` at the call site — that
        duplicates one decision 15 times.
-   [ ] Expose them to Tailwind via `@theme inline`
-   [ ] `@custom-variant dark (&:where(.dark, .dark *))`
-   [ ] Port `fontSizes.ts` (note: `sm` is a non-default `0.89rem`)
-   [ ] `html { font-size: 18px; scroll-behavior: smooth }` — easy to miss, changes everything
-   [ ] `@fontsource/raleway/400.css`, `@fontsource/quicksand/{400,700}.css`; Raleway =
        headings, Quicksand = body
-   [ ] Inline blocking dark-mode script (Chakra's `ColorModeScript` did this for you —
        without it you get a flash of the wrong theme)
-   [ ] Reconcile the Preflight/Chakra-reset delta against Phase 0 screenshots

> **Resolve first:** `styles/config.ts` says `useSystemColorMode: false` but
> `_document.tsx` renders `<ColorModeScript initialColorMode="system" />`. These
> disagree. Decide the intended behaviour rather than porting the ambiguity.

---

## Phase 4 — Content layer

-   [ ] Content collections with the `glob()` loader: `writings`, `archive`, `topics`, `special`
-   [ ] Zod schemas — `title`, `publishedAt`, `summary?`, `topics?`, `series?`. This
        replaces the hand-rolled types in `lib/posts.ts` and gives real validation
        (current tsconfig is `strict: false`)
-   [ ] **Write `remark-title-case.ts` in-repo** (~15 lines: visit `heading` nodes, run the
        `title` package with `TITLE_OPTIONS`). Deletes `remark-capitalize`, the patch,
        `patch-package`, and the `postinstall` hook.
-   [ ] Port `lib/titleCase.ts` unchanged — note titles are ALSO title-cased in JS, separately
        from headings in MDX. Both mechanisms must survive.
-   [ ] **Keep `remark-textr` + the 12 `typographic-*` packages as-is.** Do not swap to
        `remark-smartypants` in this migration — it has no arrows or math symbols, and
        `.tsx` prose contains pre-typographied characters matched to current output.
        Consolidate later, separately, if at all.
-   [ ] **Apply the GFM decision from Phase 0.** Astro defaults to `markdown.gfm: true`;
        the current site has no `remark-gfm` at all. Leaving the default on silently
        changes rendering of tables, footnotes, task lists and strikethrough.
-   [ ] `remark-unwrap-images`, `rehype-autolink-headings` (drop `rehype-slug` — Astro
        slugs headings natively)
-   [ ] Images: move `public/images/` → `src/assets/` for optimisation + automatic
        dimensions, which deletes `rehype-img-size`. **Leave `public/archive-assets/`
        alone** — 10 archive posts reference those paths.
-   [ ] Reading time + word count: `reading-time` still works, or a remark plugin
        injecting into frontmatter
-   [ ] Port `lib/topics.ts` (drop the stray `console.log(data)` on line 40)

**Exit criteria:** one post renders with correct typography and title-casing.

---

## Phase 5 — Components

All `.astro`. Zero React — the only real interactivity is the nav toggle and the
theme toggle, both ~10 lines of vanilla JS in a `<script>`.

-   [ ] `Meta.astro` — `router.asPath` → `Astro.url.pathname` for canonical + `og:url`
-   [ ] `BaseLayout.astro`, `DefaultLayout.astro` (800px column)
-   [ ] `NavBar.astro` — sticky, backdrop-blur; `useState` toggle → vanilla JS;
        `useColorMode` → theme toggle script
-   [ ] `Footer.astro`
-   [ ] `CustomLink.astro` / `StylishLink`
-   [ ] `TopicBadge.astro`
-   [ ] `SeriesOverview.astro`
-   [ ] `SideNote.astro` — 4 variants
-   [ ] `typography.astro` (`Small`), `Asterisk.astro`
-   [ ] Icons: 6 total (sun, moon, hamburger, close, rss, + 4 SideNote Material icons).
        Inline the SVGs; don't add `astro-icon` for this.
-   [ ] Chakra `Avatar` on article pages → `<img>` + `rounded-full`
-   [ ] MDX prose styling → **plain CSS in one `article.css`**, descendant selectors on the
        article container. Do not use `@tailwindcss/typography` (opinionated, you'd fight
        its defaults) and do not use `@apply`. This deletes `MDXComponents.tsx` (123 lines)
        down to just the three custom components MDX actually needs.
-   [ ] Preserve the heading-anchor behaviour (`scroll-margin-top: 5.5rem`, `#` on hover)

---

## Phase 6 — Routes

Port in this order — each is a superset of the last.

-   [ ] `/about` (static, no content deps — proves the layout chain)
-   [ ] `/` — home. **Feed generation moves out of here** into a real endpoint.
-   [ ] `/writings` index
-   [ ] `/writings/[slug]` — full article: topics, series, reading time
-   [ ] `/archive` index
-   [ ] `/archive/[slug]` — simpler article (no topics, no series)
-   [ ] `/_kitchensink` — reuses the archive article page
-   [ ] `/topics` index
-   [ ] `/[topic]` — **root-level catch-all**. Astro prioritises static routes over
        dynamic, same as Next, so the shadowing rule holds: a topic named `about`,
        `topics`, `writings`, `archive`, or `_kitchensink` would be swallowed. Preserve
        that constraint; don't "fix" it.

> Cleanup while you're here: `[topic].tsx` sets `date={new Date().toISOString()}`, which
> makes `article:published_time` change on every build and renders builds
> non-reproducible. Drop it.

---

## Phase 7 — Feeds, sitemap, redirects

-   [ ] `src/pages/feeds/feed.xml.ts` + `atom.xml.ts` + `feed.json.ts` — real endpoints,
        not a `getStaticProps` side effect. **Keep the `feed` package**; `@astrojs/rss` is
        RSS-2.0-only and you'd hand-roll Atom and JSON Feed otherwise.
-   [ ] Apply the Phase 1A decision for rendering MDX → HTML
-   [ ] Preserve the URL rewriting: `href="/#` → absolute, `href="/"` → absolute, `src="/"` → absolute
-   [ ] Preserve `string-strip-html` stripping of `script`/`style`
-   [ ] `@astrojs/sitemap` replacing `next-sitemap`; port the non-production
        `Disallow: /` robots policy
-   [ ] Feed `<link rel="alternate">` tags in `<head>` — all three (from `_document.tsx`)
-   [ ] Favicons + `site.webmanifest` links
-   [ ] **`vercel.json`** for the `/blog/:slug` → `/writings/:slug` 301. Astro's config
        `redirects` emits meta-refresh HTML in a static build, not a real 301.

---

## Phase 8 — Verification

Against `../baseline/` from Phase 0. This is the phase that justifies Phase 0 existing.

-   [ ] `npm run build`, then mirror the new site to `../candidate/`
-   [ ] `diff -rq ../baseline ../candidate` — triage every difference deliberately
-   [ ] All 65 URLs return 200; no new URLs, no missing URLs
-   [ ] `curl -I /blog/rss` returns 301 to the right place
-   [ ] Feed diff: item count, titles, dates, and `<content>` containing rendered `SideNote`
-   [ ] Screenshot diff, light **and** dark, against the Phase 0 set
-   [ ] Verify the 10 archive posts' `archive-assets` images load
-   [ ] Verify typographic output byte-identical (curly quotes, em/en dashes, arrows)
-   [ ] Verify heading title-casing incl. acronyms: `AWS`, `IAM`, `RSS`, `NextJS`, `OCJP`,
        `VirtPHP`, `TypeVar`, `SSO`, `VPS`, `PS`
-   [ ] Lighthouse: should be strictly better (React + Emotion + Chakra runtime all gone)

---

## Phase 9 — Cutover

-   [ ] Delete `next.config.js`, `next-sitemap.config.js`, `pages/`, `patches/`,
        `next-env.d.ts`
-   [ ] Prune `package.json` (~55 deps → ~12)
-   [ ] Rename the package from `with-typescript` (leftover from the Next starter)
-   [ ] Update `CLAUDE.md` — most of it describes the old pipeline
-   [ ] Deploy to a Vercel preview; verify against production with real DNS
-   [ ] Merge, then watch for 404s in Vercel analytics for a week

---

## Pre-existing issues found during the audit

Decide intent for each; don't port a bug by accident.

1. **`components/SideNote.tsx:67`** — `borderColor: 'green.333'`. Chakra has no `333`
   step, so the dark-mode success variant's border colour is silently invalid. Check what
   it _should_ be before porting.
2. **Colour-mode config mismatch** — `useSystemColorMode: false` vs
   `initialColorMode="system"` (Phase 3).
3. **`lib/topics.ts:40`** — stray `console.log(data)`.
4. **`pages/[topic].tsx`** — `new Date().toISOString()` as the article date.

---

## Dependency delta

**Gone:** `next`, `next-mdx-remote`, `next-sitemap`, all `@chakra-ui/*`, `@emotion/*`,
`framer-motion` (Chakra peer dep only — unused), `react`, `react-dom`, `react-icons`,
`patch-package`, `mdx-prism`, `rehype-img-size`, `rehype-slug`, `remark-capitalize`,
`rehype`, `rehype-raw`, `eslint-config-next`

**Kept:** `feed`, `date-fns`, `reading-time`, `title`, `string-strip-html`,
`remark-textr` + the 12 `typographic-*`, `remark-unwrap-images`,
`rehype-autolink-headings`, `rehype-code-titles`, `@fontsource/*`

**New:** `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `tailwindcss`, `@tailwindcss/vite`,
`@shikijs/transformers`
