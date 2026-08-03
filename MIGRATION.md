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
| `public/archive-assets/files/**` URLs unchanged                                 | 4 download links (PDF/xlsx) in archive posts     |
| Heading title-casing + typographic substitutions byte-identical                 | content rendering                                |
| **GFM is ON** — `_kitchensink` is expected to change; nothing else may          | decided, see Phase 0 finding 3                   |

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
| `archive-assets` images          | 7 archive posts (14 refs) — all move to `src/assets/`    |
| `archive-assets/files` downloads | 4 links — URLs must NOT change                           |
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
3. **`remark-gfm` is absent — and Astro enables GFM by default.** ✅ **DECIDED: GFM ON.**

    `remark-gfm` has never been in this project (checked the full git history), so
    tables, footnotes, task lists and strikethrough have always rendered as **literal
    text** — there is not a single `<table>` element anywhere in the built site.

    `_kitchensink.mdx` has sections literally headed "Tables", "Task lists" and
    "Footnotes" that have never worked, and `MDXComponents.tsx` has mapped
    `table`/`thead`/`tbody`/`tfoot`/`tr`/`th`/`td`/`caption` since the first commit for
    tables that never rendered. Turning GFM off would preserve a bug, and would leave
    Phase 5 with no way to style or test tables.

    **Verified blast radius** (scan strips code fences, inline code, existing links and
    raw HTML, so these are real):

    | File                                        | Change                                                                                                           |
    | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
    | `special/_kitchensink.mdx`                  | 2 tables, 5 footnote refs, 3 task items, 1 strikethrough start rendering                                         |
    | `archive/statserver-…`                      | `http://matt.aimonetti.net/posts/…` autolinks — **accepted**                                                     |
    | `archive/installing-virtual-hadoop-cluster` | `http://vm-cluster-node1:7180` autolinks — **wrap in backticks**, it's a local hostname and would be a dead link |

    Nothing else in any post is affected. See Phase 4 for the actions.

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

### 1A. Feeds ✅ PASSED — use the Container API

**Decision:** Container API. The fallback is not needed.

Ran on **Astro 7.1.6** with `@astrojs/mdx`, against real content (`iam`,
`mental-health`, `aws-multi-account`, `python-protocols`).

-   [x] `experimental_AstroContainer.renderToString()` renders a content-collection entry
-   [x] `SideNote` renders fully — `type` prop, title, slotted children, and nested
        markdown (`<em>`, `<strong>`, `<p>`) all present. `Asterisk` and `Small` too.
-   [x] Zero raw `<SideNote` strings leak into the output
-   [x] The `feed` package consumes the string and emits **all three formats**
        (rss2 / atom / json), content in CDATA
-   [x] Images render and the `src="/"` → absolute rewrite works; no leftover relative URLs
-   [x] Word-count parity against the Phase 0 baseline: 1920/1920, 1736/1736, 2305/2302

**The one non-obvious step:** the MDX renderer must be registered manually, because the
container runs outside a page render. Without this you get a cryptic failure:

```ts
import mdxRenderer from '@astrojs/mdx/server.js';
const container = await experimental_AstroContainer.create();
container.addServerRenderer({ name: '@astrojs/mdx', renderer: mdxRenderer });
const { Content } = await render(post);
const html = await container.renderToString(Content, {
    props: { components: { SideNote, Asterisk, Small } },
});
```

Custom components are passed via the `components` prop — the MDX sources don't import
them, exactly as today.

⚠️ **Pin the Astro version.** `experimental_` is in the API name for a reason; it can
break in a minor release. Working spike at `astro@7.1.6`.

### Findings from the spike (all feed into Phase 4)

1. **🐞 Pre-existing bug: feed titles are double-title-cased.** `lib/feeds.tsx:54` calls
   `makeTitle(post.frontMatter.title)` **without `TITLE_OPTIONS`**, on a string that
   `lib/posts.ts:68` has already correctly title-cased. The second pass destroys the
   acronym exceptions. Subscribers currently receive `Aws Iam Demystified` while the site
   shows `AWS IAM Demystified`. **Fix during the port; don't reproduce it.**
2. **Astro enables SmartyPants by default, and it conflicts with `remark-textr`.** The
   spike produced `–` (en dash) where the baseline has `—` (em dash), and curled quotes
   the baseline leaves straight. Set **`markdown.smartypants: false`** or typography
   silently changes across every post.
3. **`rehype-autolink-headings` accounts for the `<a>` count gap** (baseline 22 vs spike
   14 on `mental-health` — one anchor per heading). Confirms it must be ported.
4. **`remark-capitalize` confirmed load-bearing.** Baseline renders `Keeping up with Current Events`; the spike, without the plugin, renders `Keeping Up with…`.
5. **Images in `public/` get no `width`/`height` from Astro** — `<img src="…" alt="…"/>`
   and nothing else. Worse, the current site optimises images at request time via Next's
   `/_next/image`, which `public/` in Astro does **not** replace — so leaving images there
   is a regression from optimised to raw across 23.2 MB of source images. Resolved by
   the images decision below.

### 1B. Syntax highlighting ✅ PASSED — use Shiki

**Decision:** Shiki with two custom themes. Keeping Prism is not needed.

Working artifacts are committed at **[`spike/`](spike/)** — drop them straight into
Phase 4. See [`spike/README.md`](spike/README.md) for where each file lands.

-   [x] `shiki/prism-default-light.json` — Prism default palette, ported scope by scope
-   [x] `shiki/night-owl-pink.json` — Night Owl + the three `#FFA7C4` overrides
-   [x] `themes: { light, dark }` with `defaultColor: false` → **342 `--shiki-light` /
        `--shiki-dark` pairs, zero hard-coded colours** in the output
-   [x] Class-based dark toggle works. The entire light/dark mechanism is **six lines of
        CSS**, replacing ~150 lines of paired `mode()` calls in `styles/styles.ts`:

    ```css
    .astro-code,
    .astro-code span {
        color: var(--shiki-light);
        background-color: var(--shiki-light-bg);
    }
    html.dark .astro-code,
    html.dark .astro-code span {
        color: var(--shiki-dark);
        background-color: var(--shiki-dark-bg);
    }
    ```

-   [x] Line highlighting works — `transformerMetaHighlight()` emits `.line.highlighted`,
        replacing `.mdx-marker`. Verified 3 highlighted lines from `{4,5,8}`.
-   [x] Code titles work — `plugins/transformer-code-title.mjs` (~25 lines) replaces
        `rehype-code-titles` and emits the same `.rehype-code-title` div. Verified all
        three titles in `rss.mdx`.
-   [x] **Fence syntax: edit the 5 fences, don't write a parser.** The spike first used a
        `remark-normalize-code-meta.mjs` plugin to translate the existing syntax. That
        plugin was **dropped** — editing the content produces **byte-for-byte identical
        rendered output** with one fewer moving part, and moves the fences to standard
        Shiki syntax that matches every Astro doc. See "Fence edits" in Phase 4.
-   [x] Visual comparison against the Phase 0 screenshots — see
        `spike/screenshots/`

### Two gotchas found (both fixed in the artifacts)

1. **`apacheconf` is not a Shiki language** — Shiki bundles it as `apache`. Without a
   fix, the block in `archive/how-to-speed-up-your-websites.mdx` silently falls back to
   plaintext. Fixed with `langAlias: { apacheconf: 'apache' }`. All 10 languages you use
   (`bash typescript python php puppet yaml json js cpp apacheconf`) now resolve with
   **zero fallbacks**.
2. **The Prism-vs-TextMate taxonomy divergence is real and visible.** Mapping TextMate's
   `variable` scope to Prism's `.token.variable` colour painted **every function
   parameter orange** — Prism leaves parameters untokenised (verified against the
   baseline HTML: `measurements`, `window_size`, `field_name` carry no token class).
   Fixed by narrowing the scope so parameters inherit the foreground. Worth re-checking
   this class of difference on a TS and a Python block after the real port.

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
-   [ ] **Fence edits — 5 fences, 3 files.** Shiki needs a space before the line range,
        and `title="…"` instead of `:filename`. Verified in the 1B spike to produce
        byte-identical output to the plugin-based alternative. ⚠️ These edits **break the
        current Next build** (`mdx-prism` / `rehype-code-titles` expect the old form), so
        they must land in the migration commit, not on `main` beforehand.

    | File                            | Line | From                                  | To                                             |
    | ------------------------------- | ---- | ------------------------------------- | ---------------------------------------------- |
    | `writings/python-protocols.mdx` | 77   | ` ```python{4,5,8} `                  | ` ```python {4,5,8} `                          |
    | `writings/rss.mdx`              | 104  | ` ```typescript:pages/index.tsx `     | ` ```typescript title="pages/index.tsx" `      |
    | `writings/rss.mdx`              | 135  | ` ```typescript:lib/feeds.tsx `       | ` ```typescript title="lib/feeds.tsx" `        |
    | `writings/rss.mdx`              | 164  | ` ```typescript:lib/feeds.tsx `       | ` ```typescript title="lib/feeds.tsx" `        |
    | `special/_kitchensink.mdx`      | 119  | ` ```js{5,6,9-13}:components/foo.js ` | ` ```js {5,6,9-13} title="components/foo.js" ` |

-   [ ] **GFM: leave Astro's default ON** (decided — Phase 0 finding 3). Concretely:
    -   [ ] Do **not** set `markdown.gfm: false` (note the 1B spike config has it set —
            remove that line when merging `spike/astro.config.mjs`)
    -   [ ] `archive/installing-virtual-hadoop-cluster.mdx:41` — wrap
            `http://vm-cluster-node1:7180` in backticks so autolink leaves the local
            hostname alone
    -   [ ] Port the `table`/`thead`/`tbody`/`tfoot`/`tr`/`th`/`td`/`caption` styling
            (previously dead code) — `_kitchensink` now exercises it for the first time
    -   [ ] Style footnotes, task lists and `<del>` — all new elements on the page
    -   [ ] Expect a **large, intentional** Phase 8 diff on `/_kitchensink` only. Every
            other page must still diff clean.
-   [ ] `remark-unwrap-images`, `rehype-autolink-headings` (drop `rehype-slug` — Astro
        slugs headings natively)
-   [ ] **Images: move all 20 `![]()` targets to `src/assets/`** (decided). Deletes
        `rehype-img-size`. Measured on the three worst cases: `butwhy.gif` 13 MB → 2.4 MB
        (−81%), `img_20111025_152826.jpg` 1.4 MB → 468 KB (−67%), `aws-org-design.png`
        356 KB → 52 KB (−85%), plus automatic `width`/`height`, `loading="lazy"` and
        content-hashed filenames.
    -   [ ] `public/images/` → `src/assets/` — 6 refs in `writings/aws-multi-account.mdx`
            and `special/_kitchensink.mdx`
    -   [ ] `public/archive-assets/images/` → `src/assets/` — 14 refs across 7 archive
            posts. Heaviest wins are here: `burglar-s-doom` drops ~8.7 MB → ~2–3 MB.
    -   [ ] Rewrite refs to relative paths (`../../assets/foo.png` — verified working in
            the spike)
    -   [ ] ⚠️ **Leave `public/archive-assets/files/` alone** — the 4 PDF/xlsx download
            links are not images and their URLs must stay stable
    -   [ ] ✅ Animated GIF safety verified: the 791-frame `butwhy.gif` converts to
            **animated** WebP (`ANIM`/`ANMF` chunks present), not a flattened first frame
    -   [ ] Accept that asset URLs become hashed `/_astro/*`; external hotlinks to the
            old `/images/…` and `/archive-assets/images/…` URLs will break. Decided
            against keeping duplicate `public/` copies.
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
-   [ ] Verify all 20 migrated images render, and that the 4 `archive-assets/files/`
        download links still resolve at their original URLs
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
5. **`lib/feeds.tsx:54`** — feed titles are **double-title-cased**. `makeTitle()` is
   called without `TITLE_OPTIONS` on an already-title-cased string, so acronyms are
   destroyed: subscribers get `Aws Iam Demystified`, the site shows `AWS IAM Demystified`.
   Confirmed in the 1A spike. Fix during the port.
6. ~~**Dead code**~~ — resolved by the GFM decision: `MDXComponents.tsx`'s eight table
   mappings and `styles/components.ts`'s `Table` baseStyle stop being dead and get
   ported and tested against `_kitchensink`.
7. **48.3 MB of unreferenced files in `public/archive-assets/files/`** — `sf2hadoop.jar`
   (44.7 MB), `dino.swf` (3.6 MB), 3 zips and `coursera-ml-2014.pdf`. Nothing in
   `content/` links to any of them, but they are live URLs so something external might.
   Shipped in every deploy and carried in git history. **Not part of the migration** —
   decide separately whether to keep, and do not delete blind.

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
