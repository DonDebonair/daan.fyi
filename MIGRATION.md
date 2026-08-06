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
| Heading title-casing + typographic substitutions byte-identical†                | content rendering                                |
| **GFM is ON** — `_kitchensink` is expected to change; nothing else may          | decided, see Phase 0 finding 3                   |

† Three recorded exceptions, all deliberate:

1. `_kitchensink` changes wholesale because GFM is now on (Phase 0 finding 3).
2. One heading on `archive/experimenting-with-arduino` is corrected by the trim fix
   (Phase 4 finding 2).
3. Article titles on the 23 archive posts and `_kitchensink` shrink from Chakra
   `size="2xl"` to `size="xl"`, normalising them onto the writings size (Phase 6
   finding 3).

Content and heading-id comparisons must still be clean everywhere; exception 3 is
visual only and shows up in screenshots, not in the content diff.

### URL inventory — 61 pages + 6 generated files

- `/`, `/about`, `/topics`, `/writings`, `/archive`, `/_kitchensink` — 6
- `/writings/{9 slugs}` — 9
- `/archive/{23 slugs}` — 23
- `/{23 topic slugs}` — 23
  `amplify aws editors hn iam ide infrastructure lgbtqi mental-health multi-account news nextjs opinions plugins pyenv python rss snippets sourceag syndication tooling typing website`
- `/feeds/feed.xml`, `/feeds/atom.xml`, `/feeds/feed.json` — 3
- `/sitemap.xml` (**an index**), `/sitemap-0.xml`, `/robots.txt` — 3

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

- [x] `npm run build && npm start` — builds clean on Node 26
- [x] All **61 pages** fetched to `../baseline/html/`, all 200. URL list derived from
      `.next/server/pages` rather than by crawling — `/_kitchensink` is linked from
      nowhere and a link-following crawler misses it.
- [x] Feeds copied to `../baseline/feeds/` — 9 items in each of the three formats
- [x] Sitemap, `sitemap-0.xml`, robots captured
- [x] Trailing-slash + redirect + 404 behaviour recorded in `meta/behaviour.txt`
- [x] Checksums (`meta/html.sha256`, `meta/feeds.sha256`) and provenance recorded
- [x] **26 screenshots** — 13 pages × light/dark, full-page, 2× DPI, in
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

- `robots.txt` says `Disallow: /` because `VERCEL_ENV` is unset locally. Production
  gets the real policy. Compare against the local baseline, not production.
- `sharp` is not installed, so Next's image optimizer uses a slow fallback; the
  optimizer cache had to be warmed before screenshots captured images.
- Screenshots force `loading="eager"` — `next/image` lazy-loads below the fold and
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

- [x] `experimental_AstroContainer.renderToString()` renders a content-collection entry
- [x] `SideNote` renders fully — `type` prop, title, slotted children, and nested
      markdown (`<em>`, `<strong>`, `<p>`) all present. `Asterisk` and `Small` too.
- [x] Zero raw `<SideNote` strings leak into the output
- [x] The `feed` package consumes the string and emits **all three formats**
      (rss2 / atom / json), content in CDATA
- [x] Images render and the `src="/"` → absolute rewrite works; no leftover relative URLs
- [x] Word-count parity against the Phase 0 baseline: 1920/1920, 1736/1736, 2305/2302

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

- [x] `shiki/prism-default-light.json` — Prism default palette, ported scope by scope
- [x] `shiki/night-owl-pink.json` — Night Owl + the three `#FFA7C4` overrides
- [x] `themes: { light, dark }` with `defaultColor: false` → **342 `--shiki-light` /
      `--shiki-dark` pairs, zero hard-coded colours** in the output
- [x] Class-based dark toggle works. The entire light/dark mechanism is **six lines of
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

- [x] Line highlighting works — `transformerMetaHighlight()` emits `.line.highlighted`,
      replacing `.mdx-marker`. Verified 3 highlighted lines from `{4,5,8}`.
- [x] Code titles work — `plugins/transformer-code-title.mjs` (~25 lines) replaces
      `rehype-code-titles` and emits the same `.rehype-code-title` div. Verified all
      three titles in `rss.mdx`.
- [x] **Fence syntax: edit the 5 fences, don't write a parser.** The spike first used a
      `remark-normalize-code-meta.mjs` plugin to translate the existing syntax. That
      plugin was **dropped** — editing the content produces **byte-for-byte identical
      rendered output** with one fewer moving part, and moves the fences to standard
      Shiki syntax that matches every Astro doc. See "Fence edits" in Phase 4.
- [x] Visual comparison against the Phase 0 screenshots — see
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

## Phase 2 — Scaffold ✅ DONE

Scaffolded by hand from a throwaway `npm create astro@latest` reference project rather
than by running the creator in place — the repo is not empty and the creator wants to own
`package.json`, `tsconfig.json` and `.gitignore`.

- [x] Astro **7.1.6** (the version the 1A spike was verified against — pinned as planned)
- [x] `@astrojs/mdx` 7.0.5, `@astrojs/sitemap` 3.7.3
- [x] Tailwind 4.3.3 via `@tailwindcss/vite` — **not** `@astrojs/tailwind`
- [x] Path aliases in `tsconfig.json`: `@/components/*`, `@/layouts/*`, `@/lib/*` →
      `src/*`. Astro resolves `tsconfig` paths natively; no `vite-tsconfig-paths` needed
- [x] `git mv content src/content` (history preserved); `public/` stays put
- [x] `lib/config.ts` → `src/lib/config.ts`, verbatim
- [x] Prettier 2.7.1 → **3.9.6** + `prettier-plugin-astro`, same options
- [x] Husky + lint-staged kept on 8/15; `*.astro` added to the lint-staged glob
- [x] `trailingSlash: 'never'` + `build.format: 'file'` — verified: emits `index.html`,
      and `/about` (absent) 404s rather than redirecting
- [x] `type-check` is now `astro check` — **0 errors**, 0 warnings, 0 hints
- [x] `npm run build` and `npm run dev` both clean; Tailwind emits CSS; the `@/lib/*`
      alias resolves at both type-check and bundle time

### Decisions taken while scaffolding

1. **`"type": "module"`.** Astro's default, and the end state anyway. Required renaming
   `.eslintrc.js` → `.eslintrc.cjs` and `.prettierrc.js` → `.prettierrc.mjs`.
   `next.config.js` and `next-sitemap.config.js` are left as-is: nothing loads them any
   more, so their CJS-ness is inert. They are excluded from `tsconfig.json` so
   `astro check` stays quiet.
2. **The Next build is dead from this phase on, not Phase 4.** Moving `content/` breaks
   `lib/posts.ts` immediately. Rather than keep dead `next:*` scripts around, the Next
   scripts are gone. The Next _files_ stay on disk as the porting reference for Phases
   3–7 and are deleted in Phase 9.
3. **Legacy deps moved to `devDependencies`** rather than deleted — they are the porting
   reference, but none of them is a runtime dependency of the Astro build. Phase 9 just
   deletes the block.
4. **`patch-package` and the `postinstall` hook are already gone** (Phase 4 had them
   scheduled). `remark-capitalize` went with them, since keeping a patched package whose
   patch no longer applies is worse than removing both. `patches/` is now inert — Phase 9
   deletes the directory.
5. **`@types/node` 18 → 24.** Vite 8 peer-requires `^20.19.0 || >=22.12.0`; the install
   fails outright on the old pin. Also added `engines.node: ">=22.12.0"`.
6. **TypeScript pinned to `^5.9.3`, not latest.** TypeScript 7.0.2 is out, but
   `@astrojs/check` peer-requires `^5.0.0 || ^6.0.0`.
7. **`src/content/` added to `.prettierignore`.** 30 of the 33 MDX files already fail
   `prettier --check` on the pre-migration tree, so formatting was never really applied
   to content — but `prettier --write .` would now rewrite all of it, and byte-identical
   rendering is a ground rule. Revisit after Phase 8.

### Findings that change later phases

1. **⚠️ Astro 7 made the Markdown engine pluggable, and the config shape moved.**
   `markdown.gfm`, `.smartypants`, `.remarkPlugins`, `.rehypePlugins` and `.remarkRehype`
   are **all deprecated** at the `markdown` level and now belong on a processor:

    ```js
    import { unified } from '@astrojs/markdown-remark';
    markdown: {
        processor: unified({ smartypants: false, remarkPlugins: [...], rehypePlugins: [...] }),
        shikiConfig: { ... },   // NOT deprecated — stays at this level
    }
    ```

    `markdown.shikiConfig` and `markdown.syntaxHighlight` are unaffected, so the **1B
    spike's `shikiConfig` still drops in unchanged**. Only the `gfm`/`smartypants` lines
    move. Already applied to `astro.config.mjs`; Phase 4 adds the plugin arrays inside
    `unified()` rather than next to it.

    This also answers the original "is rehype still current?" question: unified/remark/
    rehype is now _one_ processor option rather than the only path (Astro also ships
    `satteri`), but it is still first-class and is what this port uses.

2. **`@astrojs/sitemap` emits `sitemap-index.xml`, not `sitemap.xml`.** The baseline has
   `sitemap.xml` (an index) + `sitemap-0.xml`. Out of the box `/sitemap.xml` would 404 —
   a real regression, not a cosmetic one. There is a `filenameBase` option but it renames
   _both_ files. Resolve in Phase 7 (this is open decision 4).

3. **Stale generated artifacts were sitting in `public/`.** `public/feeds/*`,
   `public/sitemap*.xml` and `public/robots.txt` are gitignored but were still on disk
   from the last Next build — and Astro copies `public/` verbatim, so they landed in
   `dist/` and made the site look like it already had working feeds. **Deleted.** Phase 7
   must now generate them for real, and Phase 8 cannot get a false pass. The only copies
   are in `../baseline/`.

**Exit criteria:** met — site builds, dev server serves, aliases resolve, `astro check`
is clean.

---

## Phase 3 — Design system ✅ DONE

The single highest-leverage step. Getting tokens right first means components are
mechanical; retrofitting them later is miserable.

- [x] **Chakra colour values, already extracted.** Captured here because the extraction
      needs `@chakra-ui/react` in `node_modules`, which the cutover uninstalls — after
      that these are painful to recover.

    | Token            | Value                    | Token            | Value                                            |
    | ---------------- | ------------------------ | ---------------- | ------------------------------------------------ |
    | `gray.50`        | `#F7FAFC`                | `teal.200`       | `#81E6D9`                                        |
    | `gray.100`       | `#EDF2F7`                | `teal.300`       | `#4FD1C5`                                        |
    | `gray.200`       | `#E2E8F0`                | `teal.400`       | `#38B2AC`                                        |
    | `gray.600`       | `#4A5568`                | `teal.500`       | `#319795`                                        |
    | `gray.700`       | `#2D3748`                | `teal.800`       | `#234E52`                                        |
    | `gray.800`       | `#1A202C`                | `teal.900`       | `#1D4044`                                        |
    | `gray.900`       | `#171923`                | `cyan.600`       | `#00A3C4`                                        |
    | `green.200`      | `#9AE6B4`                | `blue.100`       | `#BEE3F8`                                        |
    | `green.700`      | `#276749`                | `blue.600`       | `#2B6CB0`                                        |
    | `yellow.200`     | `#FAF089`                | `red.200`        | `#FEB2B2`                                        |
    | `yellow.300`     | `#F6E05E`                | `red.700`        | `#9B2C2C`                                        |
    | `yellow.700`     | `#975A16`                | `whiteAlpha.800` | `rgba(255,255,255,0.80)`                         |
    | `whiteAlpha.900` | `rgba(255,255,255,0.92)` | `green.333`      | ⚠️ **does not exist** — see pre-existing issue 1 |

- [x] **Semantic tokens** as CSS custom properties in `:root`, flipped in `.dark` —
      `src/styles/global.css`. 40 roles covering every colour decision in the old code
      (surface/text/rule/divider, accent, series overview, the four SideNote variants,
      code blocks, inline code, heading anchor). Components name a role, never a colour.
- [x] Exposed to Tailwind via `@theme inline` — `inline` is what makes utilities compile
      to `var(--ui-*)` instead of a frozen value, so one `.dark` block flips everything
- [x] `@custom-variant dark (&:where(.dark, .dark *))`
- [x] `fontSizes.ts` ported, including the non-default `sm: 0.89rem`
- [x] `html { font-size: 18px; scroll-behavior: smooth }`
- [x] `@fontsource/raleway/400.css`, `@fontsource/quicksand/{400,700}.css` — imported from
      `global.css`; 9 `.woff2` files emitted and referenced correctly
- [x] Inline blocking dark-mode script — `src/components/ColorModeScript.astro`. Verified
      to emit as a synchronous inline `<script>` in `<head>` **before** the stylesheet
      link, so `.dark` is set before first paint
- [x] Reconcile the Preflight/Chakra-reset delta — carried through Phase 5 and finally
      done **properly in Phase 8**, by diffing the two resets declaration by declaration
      rather than by eye. Nine properties were missing; the font-smoothing pair was
      visibly changing dark-mode contrast. See Phase 8, fifth bug.

### ✅ Colour mode: follow the system preference (decided)

Resolves pre-existing issue 2. Concretely: OS preference is the default, a manual toggle
overrides it and persists, and OS changes are followed live only while no override is
stored. The toggle has to keep working — the NavBar's sun/moon button is part of the
styling the migration is preserving — so "follow the system" can only mean _default to_,
not _always obey_.

The script reads Chakra's old `chakra-ui-color-mode` key as a fallback, so visitors who
already chose a mode keep it across the cutover. New writes go to `color-mode`.
⚠️ `spike/tools/capture-screenshots.mjs` seeds the **old** key — update its
`addInitScript` before the Phase 8 dark-mode capture, or every dark screenshot will
silently come out light.

### Decisions taken while building the token layer

1. **Tailwind's default colour palette is removed** (`--color-*: initial`, keeping only
   `transparent`/`current`/`white`/`black`). Tailwind's `gray-800` is **not** Chakra's
   `gray.800`, so leaving the palette in place invites a silently-wrong one-off during
   the component port. Anything a component needs must be given a named role first.
2. **The font-size namespace is cleared, not patched** (`--text-*: initial`). Tailwind
   pairs every size with a line-height; Chakra's `fontSize` sets font-size only and lets
   line-height come from the cascade. Clearing the namespace reproduces Chakra's
   semantics exactly. Body line-height is set once (`1.5` = Chakra `lineHeights.base`).
3. **Raleway is loaded at 400 only**, so bold headings are browser-synthesised. That is
   what the Chakra build did (`_app.tsx` imports exactly three faces) — reproduced
   deliberately.
4. **`color-scheme` is deliberately not set.** Verified absent from the baseline HTML;
   setting it would change native scrollbar and form-control rendering in dark mode and
   show up as an unexplained Phase 8 screenshot diff.
5. **The `:focus:not(:focus-visible)` reset in `styles.ts` is dropped.** It existed to
   suppress Chakra's focus box-shadow. Nothing in the new stack draws one.
6. **`green.333` resolved to `green.200`** (`#9AE6B4`) — see below.

### Findings

1. **🐞 The dark-mode success SideNote currently has no left border colour at all.**
   `green.333` is not a Chakra step, so it passes through as the literal CSS value
   `green.333`, which is invalid, so the declaration is dropped and the border falls back
   to `currentColor`. Ported as **`green.200` `#9AE6B4`**, following the pattern of the
   other three variants, whose dark border equals their light background
   (`info` blue.100/blue.100, `danger` red.200/red.200). **This is an intentional visual
   change in dark mode** — expect it in the Phase 8 diff, and it is a one-line revert if
   the border should stay invisible.

2. **⚠️ The baseline HTML understates dark mode, and cannot be used as the colour source
   of truth.** Every `useColorModeValue` is resolved _at render time_, so the statically
   emitted HTML bakes in the **light** branch; the dark rules Emotion emits alongside it
   are Chakra's own computed variants, not the author's dark choice. Caught on inline
   code: `MDXComponents.tsx` asks for `colorScheme` `gray`/`pink`, but the baseline HTML
   contains gray for _both_ modes — the pink only appears after hydration.

    Consequence: colour values were taken from the **source**, not the baseline HTML.
    The Phase 0 **screenshots** are still authoritative, because they were captured from
    a live, hydrated browser.

3. **Two different divider colours exist and had to be kept apart.** The MDX `<hr>` uses
   `gray.200`/`gray.600` (explicit, in `MDXComponents.tsx`); the footer `<Divider/>` uses
   Chakra's default border colour, `gray.200`/`whiteAlpha.300`. Identical in light mode,
   different in dark. Hence both `--ui-rule` and `--ui-divider`.

4. **The dark body background is `gray.900`, not Chakra's `gray.800` default** —
   `styles.ts` overrode it. Easy to get wrong by reading Chakra's semantic tokens alone.

**Exit criteria:** met — build clean, `astro check` clean, tokens emit under `:root` and
flip under `.dark`, fonts resolve. `src/pages/index.astro` is a temporary swatch page
rendering every token in both modes; Phase 6 replaces it.

---

## Phase 4 — Content layer ✅ DONE

**Verified against the baseline: 31 of 33 documents have byte-identical heading ids and
identical typographic-character counts.** Both exceptions are intended: `_kitchensink`
changes because GFM is now on (finding 1), and one heading on
`archive/experimenting-with-arduino` is corrected by the trim fix (finding 2).

- [x] Content collections with the `glob()` loader — `writings`, `archive`, `special` in
      `src/content.config.ts`. **`topics` is not defined**: `content/topics/` has never
      existed, so an empty collection would be dead weight. Add it the day a preamble is
      written.
- [x] Zod schemas replacing the hand-rolled types in `lib/posts.ts`. `publishedAt` stays a
      **string**, deliberately — the frontmatter holds `'2022-03-21'`, which is what
      `article:published_time` and the feeds emit verbatim; `z.coerce.date()` would
      re-serialise it as `2022-03-21T00:00:00.000Z` and change every page.
- [x] `src/plugins/remark-title-case.ts` written in-repo. `remark-capitalize`,
      `patch-package` and the `postinstall` hook are gone (they went in Phase 2).
- [x] `lib/titleCase.ts` ported unchanged; `postTitle()` in `src/lib/posts.ts` keeps the
      separate JS title-casing of frontmatter titles alive
- [x] `remark-textr` + the 12 `typographic-*` packages kept as-is
- [x] **Fence edits — 5 fences, 3 files**, all applied
- [x] GFM left ON; `http://vm-cluster-node1:7180` wrapped in backticks
- [x] `remark-unwrap-images` (verified: no `<p>`-wrapped images) and
      `rehype-autolink-headings`
- [x] **Images moved to `src/assets/` — 21 files**, all optimised to WebP
- [x] Reading time + word count — `postStats()` in `src/lib/posts.ts`, both derived from
      `entry.body`, the same raw MDX source the old code used
- [x] `lib/topics.ts` ported, minus the stray `console.log(data)`
- [ ] Styling for tables, footnotes, task lists and `<del>` — **moved to Phase 5**, where
      the rest of the prose CSS lives

### The `rehypeHeadingIds` gotcha

`rehype-slug` is replaced by Astro's own slugger, but it has to be listed **explicitly**
as the first rehype plugin:

```js
rehypePlugins: [rehypeHeadingIds, rehypeAutolinkHeadings];
```

Astro otherwise injects it _after_ user plugins, so `rehype-autolink-headings` finds no
ids to link to and silently does nothing — no error, just missing anchors. Verified: the
emitted anchor markup is structurally identical to the baseline, down to the
`<span class="icon icon-link">` that the `a span:after { content: "#" }` rule targets.

The one difference is the href form: the baseline emits `href="/writings/iam#accounts-…"`
because Next's `<Link>` resolved the hash against the current route; Astro emits plain
`href="#accounts-…"`. Behaviourally identical — kept as the simpler standard form.

### Verification results

| Check                                            | Result                                                          |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Heading ids across 33 docs                       | 32 identical, 1 intended difference                             |
| Typographic characters (14 kinds) across 33 docs | 32 identical, 1 intended difference                             |
| Shiki dual-theme var pairs                       | 1792, **0 hard-coded colours**                                  |
| Code titles                                      | 4 (3 in `rss.mdx`, 1 in `_kitchensink`)                         |
| Highlighted lines                                | 10 (3 from `{4,5,8}`, 7 from `{5,6,9-13}`)                      |
| Plaintext fallbacks                              | 0 — `apacheconf` resolves via `langAlias`                       |
| `<img>` tags                                     | 21, all with `width`/`height` + `loading="lazy"`, 0 unoptimised |

### Findings

1. **The `_kitchensink` diff is exactly the GFM change, and it is self-explaining.**
   Two new things appear: a `footnote-label` heading id, and the em-dash count collapses
   from **79 to 2**. That second number is the interesting one — with GFM off, table
   separator rows like `|---------|` were plain text, so `typographic-em-dashes` turned
   every run of hyphens into em dashes. With GFM on the table parser consumes those rows
   and they never reach textr. Confirmed rendering: 2 tables, 1 `<del>`, 3 task
   checkboxes, 23 footnote references — all zero in the baseline.

2. **🐞 The `remark-capitalize` trim quirk — found, and ✅ fixed.**
   The original trims _every_ text node inside a heading, including nested ones, which
   deletes the spaces separating them. `archive/experimenting-with-arduino.mdx:11` reads
   `## Help! [My girlfriend](…) can't choose between twitter and the television!` and the
   **live site renders `Help!My GirlfriendCan't Choose between Twitter and the
Television!`**, with the matching id `helpmy-girlfriendcant-choose-…`.

    The trim compensated for nothing: `title()` preserves leading and trailing whitespace,
    so simply dropping it produces exactly what title-casing the heading as a whole would
    produce. Verified all three ways — current, no-trim, and whole-heading-then-
    redistribute — with no-trim and whole-heading giving byte-identical results. Dropping
    the trim is therefore the principled fix, not a workaround, and it avoids
    whole-heading redistribution's fragile assumption that `title()` preserves length.

    |        | Output                                                                 |
    | ------ | ---------------------------------------------------------------------- |
    | before | `Help!My GirlfriendCan't Choose between Twitter and the Television!`   |
    | after  | `Help! My Girlfriend Can't Choose between Twitter and the Television!` |

    **This is a deliberate, recorded exception to the "heading title-casing byte-identical"
    ground rule** — that rule exists to catch accidental regressions in a mechanical port,
    not to enshrine a bug. Blast radius is one heading in 33 documents (only two headings
    anywhere contain inline markup, and `_kitchensink`'s is a single text node). The anchor
    id changes to `help-my-girlfriend-cant-choose-…`; nothing in `src/content/` or
    `public/` links to the old one, and a stale external fragment still loads the page.

    ⚠️ **Phase 8 will show this as a diff on `archive/experimenting-with-arduino` — one
    heading and one id. That is expected.**

3. **The image move needed more care than "move all 20 `![]()` targets".** Three files
   that look like images are not, and moving them would have broken things silently:

    | File                                                    | Why it must stay in `public/`                                                                        |
    | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
    | `images/banner.png`                                     | the default OG/Twitter image (`Meta.tsx`, `lib/feeds.tsx`) — an absolute URL, never a markdown image |
    | `archive-assets/images/hadoop-bigdata-applications.png` | the **link target** of `[![small](…)](full)` — only the inner `-small` image moves                   |
    | `archive-assets/images/blockchain.jpg`                  | used as a plain link href, not an image                                                              |

    Also `images/daan.png` stays for now — it is the article-page avatar and belongs to
    Phase 5, which can import it from `src/assets/` if that is wanted.

4. **Astro does resolve reference-style image definitions.** `_kitchensink` uses
   `![Alt text][id]` with `[id]: /images/dojocat.jpeg` further down. That was the one
   image form at risk of silently 404-ing; it optimises correctly and keeps its title
   attribute.

5. **The animated GIF survives frame-for-frame.** `butwhy.gif` is **87** frames (not 791
   — that figure in the Phase 1 notes was wrong); the WebP has 87 `ANMF` chunks.
   13.1 MB → 2.4 MB, −81%.

6. **`minion.png` got 18% _bigger_ as WebP** (27 kB → 32 kB). Harmless at this size, but
   it shows the conversion is not a free win on already-small PNGs.

**Exit criteria:** exceeded — all 33 documents render, not just one, and the heading and
typography comparison against `../baseline/` is clean apart from the intended GFM diff.

> ⚠️ **`src/pages/check/[collection]/[slug].astro` is temporary.** It renders every entry
> as bare content so the pipeline can be diffed before page chrome exists. **Phase 6 must
> delete it** — these are real URLs that would otherwise ship.

---

## Phase 5 — Components ✅ DONE

All `.astro`, zero React. The two pieces of state Chakra managed — the mobile menu and the
colour mode — are about fifteen lines of vanilla JS between them.

- [x] `Meta.astro` — `router.asPath` → `Astro.url.pathname`
- [x] `BaseLayout.astro` (whole document, replacing `_app.tsx` + `_document.tsx` +
      `BaseLayout.tsx`), `DefaultLayout.astro` (the 800px column)
- [x] `NavBar.astro` — sticky, backdrop-blur, `opacity: 0.75`; menu toggle and theme
      toggle in vanilla JS
- [x] `Footer.astro`
- [x] `CustomLink.astro` with the `stylish` prose-link variant
- [x] `TopicBadge.astro`, `SeriesOverview.astro`
- [x] `SideNote.astro` — four variants, all eight colours from tokens
- [x] `Small.astro`, `Asterisk.astro`
- [x] `PostsList.astro` + `PostSummaryList.astro`
- [x] **`Icon.astro` — thirteen icons, not six.** The plan undercounted: it missed the
      four social icons in the footer. Path data was extracted verbatim from
      `@chakra-ui/icons` and `react-icons`, so these are the same shapes rather than
      lookalikes.
- [x] Chakra `Avatar` → `<img>` + `border-radius: 9999px`
- [x] Prose styling → `src/styles/article.css`, plain descendant selectors on `.article`.
      No `@tailwindcss/typography`, no `@apply`. Replaces `MDXComponents.tsx` (123 lines)
      and the syntax-highlighting half of `styles/styles.ts`
- [x] Heading anchors preserved — `scroll-margin-top: 5.5rem` and the `#` on hover
- [x] Tables, footnotes, task lists and `<del>` styled (carried over from Phase 4)
- [x] Preflight/Chakra-reset delta reconciled (carried over from Phase 3) — verified by
      screenshot against `../baseline/`, not by reading the two resets side by side

### Verification

Captured at 1280px — the width the Phase 0 baseline used, so line wrapping is comparable
rather than merely similar — in both colour modes, and compared against
`../baseline/screenshots/`. Column width, wrapping, badges, the series box, the danger
SideNote, tables, task lists, code titles and line highlighting all line up.

Backgrounds confirmed programmatically: `rgb(255,255,255)` light, `rgb(23,25,35)` dark —
`gray.900`, the `styles.ts` override, not Chakra's `gray.800` default.

### Findings

1. **🐞 Fixed a real bug in the spike's Shiki CSS.** The 1B spike's "six lines of CSS"
   snippet set `background-color` on `.astro-code span` as well as on `.astro-code`.
   `--shiki-*-bg` is set on the `<pre>` and **inherits**, so every token span painted its
   own opaque rectangle on top of the highlighted-line band — turning it into a row of
   dark boxes. Nearly invisible in light mode, obvious in dark, which is why it survived
   the spike. Spans take the colour; the block takes the background. Corrected in
   `article.css` and in `spike/README.md`.

2. **⚠️ Chakra's breakpoints are not Tailwind's, and `sm` is the one that matters.**
   Chakra switches at **30em (480px)**, Tailwind at **40rem (640px)**. The NavBar
   collapses at `sm`, so Tailwind's defaults would have moved the layout switch by 160px
   on every phone. All breakpoints are now overridden to Chakra's values in `global.css`.
   (`md` happens to agree at 48em/48rem: in media queries both units resolve against the
   initial 16px font size, not the 18px root.)

3. **GFM emits alignment as inline `style="text-align:right"`, not an `align` attribute.**
   The old `MDXComponents.tsx` branched on `props.align`, so a faithful port of that logic
   would have been dead code. Verified in the build output and dropped.

4. **`public/site.webmanifest` has never been linked.** The plan listed adding the link as
   Phase 7 work, but the baseline HTML has no `rel="manifest"` — so adding it would be a
   change, not a port. Left out, with a comment in `BaseLayout.astro`.

5. **Indented code blocks render as paragraphs — in both stacks.** MDX disables indented
   code, so `_kitchensink`'s "Indented code" example has never been a `<pre>`. Confirmed
   identical in baseline and candidate before assuming a regression.

6. **SideNote titles are `<h2>`**, because Chakra's `<Heading>` defaults to `h2`. Matched
   rather than "improved" to `h3` — the level is part of the document outline.

7. **`Asterisk` loses its Chakra tooltip** and uses a native `title` instead. Same
   content, browser-native presentation and delay. Adding a tooltip library for one
   component was not worth it; revisit if the styling matters.

**Exit criteria:** met — every component ported, prose CSS complete, and the rendered
pages verified against the baseline in both colour modes.

---

## Phase 6 — Routes ✅ DONE

**All 61 URLs emit, with none missing and none extra** — verified against
`../baseline/meta/urls.txt` by set comparison, not by counting.

- [x] `/about` — static, proves the layout chain
- [x] `/` — home. **Feed generation is gone from here**; it becomes real endpoints in
      Phase 7, so the home page no longer has to be built for subscribers to get anything
- [x] `/writings` index (its `<title>` really is `Blog | Daan Debie`, kept as-is)
- [x] `/writings/[slug]` — topics, series, reading time
- [x] `/archive` index and `/archive/[slug]` — no topics, no series
- [x] `/_kitchensink` — reuses the archive article presentation
- [x] `/topics` index
- [x] `/[topic]` — root-level catch-all. Astro prioritises static routes over dynamic ones
      exactly as Next did, so the shadowing constraint is preserved rather than "fixed"
- [x] `src/pages/check/` deleted
- [x] `date={new Date().toISOString()}` dropped from `/topics` and `/[topic]` — builds are
      reproducible again

### Findings

1. **🐞 `build.format: 'file'` silently corrupted every canonical URL.**
   `Astro.url.pathname` is the _emitted file_ path, so at build time it reads
   `/about.html`, not `/about`. Every page was publishing
   `<link rel="canonical" href="https://www.daan.fyi/about.html">` and a matching
   `og:url` — URLs that are not the ones served. Caught by diffing the full meta block
   against the baseline rather than eyeballing pages. `Meta.astro` now strips the
   extension and collapses `/index.html` to `/`. **After the fix, every page's metadata
   matches the baseline exactly**, apart from the two intended date removals.

2. **⚠️ `/_kitchensink` cannot be a page file.** Astro excludes anything under
   `src/pages` whose filename starts with `_` from routing, so `_kitchensink.astro`
   would never build — silently, with no error and no page. The exclusion applies to
   filenames, not to param values, so the URL is emitted from the root-level
   `[topic].astro` catch-all instead, which is the only root-level dynamic route.
   Documented in that file.

3. **The two article pages used different title sizes — ✅ normalised, deliberately.**
   `/writings/[slug]` used Chakra `size="xl"` and `/archive/[slug]` used `size="2xl"`, so
   archive titles rendered larger. That was carried across faithfully at first, then
   **normalised onto the writings size (`xl`) on request**. `ArticleLayout` no longer
   takes a `titleSize` prop at all.

    Verified by computed style at the 18px root: all three article routes now report
    **40.5px / 48.6px**, where archive and `_kitchensink` previously reported 54px / 54px.

    ⚠️ **This changes 24 pages** — 23 archive posts plus `_kitchensink` — and is the third
    recorded exception to the byte-identical ground rule. Expect it in the Phase 8 diff.

    Unchanged: `/` and `/about` keep `size="2xl"` for their page titles. They are not
    article pages, and the request was specifically about writings versus archive.

4. **Astro emits no 404 page unless you write one.** Next generated one automatically and
   wrapped it in the app layout — the Phase 0 capture has it, with NavBar and Footer.
   Without `src/pages/404.astro` Vercel would have served its own generic page. Added,
   with the baseline's title and wording.

5. **`@astrojs/sitemap` emits extensionless URLs** despite `build.format: 'file'`, so it
   needs no equivalent fix. The remaining sitemap question is still the filename one from
   Phase 2 (`sitemap-index.xml` vs `sitemap.xml`), which Phase 7 settles.

**Exit criteria:** met — 61 pages plus a 404, URL-for-URL identical to the baseline, all
metadata matching, and the content comparison still showing only the two intended
differences.

---

## Phase 7 — Feeds, sitemap, redirects ✅ DONE

- [x] `src/pages/feeds/{feed.xml,atom.xml,feed.json}.ts` — real endpoints over a shared,
      memoised builder in `src/lib/feeds.ts`. All three formats emit 9 items.
      **The `feed` package is kept**; `@astrojs/rss` is RSS-2.0-only
- [x] Container API renders the MDX, per the Phase 1A decision. `SideNote` survives into
      the feed (1 `<aside>` in `iam` and in `mental-health`, matching the baseline), zero
      raw `<SideNote` leaks
- [x] All three URL rewrites preserved — zero relative `href="/` or `src="/` remain
- [x] `string-strip-html` still strips `script`/`style`, and moved to `dependencies`
- [x] `@astrojs/sitemap` replaces `next-sitemap`; **60 URLs, exactly the baseline set**
- [x] `robots.txt` regenerated, including the non-production `Disallow: /` policy
- [x] Feed `<link rel="alternate">` tags — done in Phase 5's `BaseLayout`
- [x] `vercel.json` for `/blog/:slug` → `/writings/:slug`. Vercel's `permanent: true`
      emits **308**, matching Next's, so the Phase 0 finding is honoured

### Fixed pre-existing bugs

1. **Feed titles were double-title-cased.** `lib/feeds.tsx:54` called `makeTitle()` without
   `TITLE_OPTIONS` on an already-cased string. Subscribers got `Aws Iam Demystified`;
   they now get `AWS IAM Demystified`, matching the site.
2. **The Atom `<icon>` pointed at a file that has never existed**
   (`/favicons/banner.png`). Now `/favicons/favicon-32x32.png`. Note this field only ever
   surfaces in Atom — RSS uses `<image>` and JSON Feed uses `icon`, both of which point at
   the banner as before.

### Findings

1. **🐞 The sitemap was about to publish `/_kitchensink`.** `next-sitemap` skipped
   underscore-prefixed paths as internal, so the styling test page was never listed.
   Astro has no such rule, and its sitemap came out with 61 URLs against the baseline's 60. An explicit `filter` restores the exclusion — otherwise a deliberately unlinked
   test page would have been handed to search engines.

2. **⚠️ The build ran two different versions of `title` at once, and consolidating them
   changed six headings.** `remark-capitalize` bundled its own `title@3.3.1` for
   headings, while frontmatter titles used the root `title@3.5.3`. The port uses 3.5.3
   for both.

    | Heading                          | Baseline (3.3.1)               | Now (3.5.3)                    |             |
    | -------------------------------- | ------------------------------ | ------------------------------ | ----------- |
    | `writings/rss`                   | Running **Typescript** Modules | Running **TypeScript** Modules | ✅ better   |
    | `archive/statserver-…`           | **Github**                     | **GitHub**                     | ✅ better   |
    | `archive/virtphp-…`              | and **Php** Versions           | and **PHP** Versions           | ✅ better   |
    | `archive/autoplaylistpoetry`     | Installation/**Usage**         | Installation/**usage**         | ↩︎ recovered |
    | `archive/download-prohibition-…` | “**I**nternettax”              | “**i**nternettax”              | ↩︎ recovered |
    | `writings/new`                   | Previously **on**…             | Previously **On**…             | ⚠️ accepted |

    The two marked ↩︎ were recovered by adding `Usage` and `Internettax` to
    `TITLE_OPTIONS.special`, which forces exact casing. **`Previously On…` is an accepted
    change** — 3.5.3 capitalises the final word, which is standard title case, and it is
    not reachable through `special`. Heading **ids are unchanged in all six cases**, so no
    anchor breaks.

3. **🔍 Heading ids were the wrong verification signal for this.** Slugs are lowercased,
   so every one of the six casing changes above was invisible to the Phase 4 comparison,
   which only compared ids. The comparison now checks heading **text** keyed by id.
   Worth remembering for Phase 8: matching ids does not mean matching headings.

4. **Feed dates move from local to UTC, deliberately.** `lib/feeds.tsx` used date-fns
   `parseISO`, which resolves a date-only string to _local_ midnight — so `2023-07-23`
   became `Sat, 22 Jul 2023 22:00:00 GMT` when built in CEST, and would differ again on
   Vercel. `new Date()` on a date-only string is UTC by spec. Builds are now
   timezone-independent, and match what production already emitted.
   **Expect a few hours' difference against the local baseline in Phase 8.**

5. **`robots.txt` locally now says allow, where the baseline said `Disallow: /`.**
   `next-sitemap` ran as a separate postbuild process with `NODE_ENV` unset; Astro builds
   with `NODE_ENV=production`. On Vercel the deciding variable is `VERCEL_ENV`, which is
   correct in both cases: preview deploys get `Disallow: /`, production does not.
   A local-only difference — do not chase it in Phase 8.

6. **`/sitemap.xml` is emitted by hand.** `@astrojs/sitemap` names its index
   `sitemap-index.xml` and `filenameBase` renames both files together, so it cannot
   reproduce `sitemap.xml` + `sitemap-0.xml`. A small endpoint re-emits the index at the
   original URL. `sitemap-index.xml` is still produced by the integration and left in
   place — unreferenced, harmless, and not configurable away. **That is one extra
   generated file versus the baseline.**

7. **`lastmod` is deliberately dropped from the sitemap.** next-sitemap stamped every URL
   with the build time — one identical, meaningless timestamp across all 60 URLs, and
   non-reproducible. Same reasoning as the `/topics` date dropped in Phase 6.
   `changefreq: monthly` and `priority: 0.7` are preserved.

8. **Not fixed, and identical to the baseline:** in `writings/rss`, the inline code
   examples `<script>` and `<style>` are mangled by `string-strip-html` — a post about
   stripping those tags has them stripped out of its own feed entry. Verified byte-for-byte
   identical in the baseline, so it is pre-existing and out of scope.

**Exit criteria:** met — three feeds with 9 items each, sitemap matching the baseline URL
set exactly, robots.txt restored, and the legacy redirect configured as a 308.

---

## Phase 8 — Verification ✅ DONE

Against `../baseline/`. Candidate mirrored to `../candidate/`.

- [x] `npm run build` → 62 HTML files (61 pages + 404)
- [x] **All 61 pages, 6 generated files, 4 download links and 4 kept `public/` images
      return 200** — zero failures
- [x] No new URLs, no missing URLs (set comparison against `meta/urls.txt`)
- [x] Sitemap: **60 URLs, byte-identical index**, same URL set as the baseline
- [x] Feeds: 9 items in all three formats, same URLs in the same order, `SideNote`
      survives, zero raw component leaks, zero relative URLs left
- [x] **Screenshot diff, light and dark, all 13 pages × 2 modes**
- [x] All 21 optimised images resolve; 0 missing files; the 4 `archive-assets/files/`
      downloads still at their original URLs
- [x] Typography: identical counts of all 14 typographic characters on 32/33 documents
- [x] Heading title-casing verified by **id and by text**; all 10 acronyms preserved at
      identical counts (`AWS` 13, `IAM` 5, `NextJS` 3, `PS` 4, `SSO` 3, `VirtPHP` 2,
      `VPS` 2, `OCJP` 1, `RSS` 1)
- [x] Theme toggle and mobile menu verified working on the built site, including
      persistence across reload
- [ ] `curl -I /blog/rss` — **cannot be tested locally**; `vercel.json` redirects are
      applied by Vercel's edge, not by a static file server. Verify on the preview deploy
      in Phase 9.

### Result: better than "strictly better"

|                                    | baseline                    | candidate                  |
| ---------------------------------- | --------------------------- | -------------------------- |
| HTML across 5 representative pages | 409,364 bytes               | **126,263 bytes** (−69.2%) |
| `<script>` tags per page           | 10–14                       | **2**, both inline         |
| JavaScript files shipped           | React + Next runtime chunks | **0 files, 0 bytes**       |
| CSS                                | inline Emotion, per page    | 2 files, 36 KB, cached     |

Lighthouse was not run: with zero shipped JS and 69% less HTML the direction is not in
question, and a number from this machine would not be comparable to production anyway.

### 🐞 Four real layout bugs the screenshot diff caught

None of these produced an error, appeared in a content diff, or looked wrong in isolation.
Every one was found by measuring where the two builds drifted apart.

1. **Chakra's `<Heading>` defaults to `size="xl"`.** A heading written as
   `<Heading fontSize="lg">` therefore keeps size xl's **line-height** (1.33, or 1.2 above
   48em) while overriding only the font-size. I had used 1.2, and in one place the body's
   1.5. Wrong on the post lists, the topics index and the SideNote titles.

2. **Flex items do not collapse margins — and the article body was a flex column.**
   The rendered MDX used to be direct children of a `<Flex direction="column">`, so
   adjacent blocks _summed_ their margins. As a plain block container they collapse to
   `max(mb, mt)`, losing ~9px at every boundary — **about 800px over a long article**,
   which matched the observed drift almost exactly. `.article` is now a flex column with
   `align-items: flex-start`, which is also why `hr`, `pre`, `table` and the code-title
   wrapper carry an explicit `width: 100%`.

3. **A topic badge is a `<span>` inside an `<a>`, and the anchor is the flex item.**
   The anchor inherits the 18px/1.5 body line-height, so the badge row is 27px tall even
   though the badge is 16px. Collapsing the two elements into one made every post entry
   ~11px shorter — visible across the home page and both index listings.

4. **Chakra `<Text>` is a `<p>` with 0.5rem margins, and I had used bare `<span>`s.**
   In a flex container those margins are not collapsed away. The footer copyright and the
   article byline were each 1rem short.

After fixing all four, **six of the thirteen pages match the baseline height exactly**
(home, writings-index, archive-index, topics-index, topic-page, about), and the article
pages land within 12–108px on lengths of 5,000–16,000px.

### 🐞 A fifth bug, found afterwards by looking at the site

Those four fixes left a uniform 0.5–2.8% pixel difference on pages whose heights matched
exactly. The diff table below originally wrote that off as "text antialiasing only". It
**was** antialiasing — and it was a missing reset property, not noise.

Chakra's CSSReset sets `-webkit-font-smoothing: antialiased` (plus
`-moz-osx-font-smoothing: grayscale`) on `html`; Tailwind's Preflight does not. On macOS
the browser default is _subpixel_ antialiasing, which renders light-on-dark text
noticeably heavier — so dark mode came out visibly higher-contrast than the original.

The full Preflight/Chakra delta was then reconciled declaration by declaration instead of
by eye. `html` gained the two font-smoothing properties, `text-rendering: optimizeLegibility`,
`-webkit-text-size-adjust: 100%` and `touch-action: manipulation`; `body` gained
`position: relative`, `min-height: 100%`, `font-feature-settings: "kern"` and the 200ms
`background-color` transition Chakra used to animate the colour-mode toggle.
(`margin: 0` was already covered by Preflight's universal selector.)

**Three pages became pixel-identical — 0.00%, not one differing pixel — in both modes**,
and the rest collapsed to near-zero:

| Page                                     | before   | after      |
| ---------------------------------------- | -------- | ---------- |
| `about`, `archive-index`, `topics-index` | 1.0–2.8% | **0.00%**  |
| `topic-page`, `home`, `writings-index`   | 0.6–1.5% | 0.02–0.04% |
| `post-sidenote`                          | 6.3%     | 4.3%       |
| `post-sidenote-series`                   | 5.1%     | 3.4%       |
| `post-code-titles`                       | 12.4%    | 10.8%      |

The lesson worth keeping: a small but _uniform_ pixel difference across pages that
otherwise match is a signal, not noise. Font smoothing does not change metrics, only
rendering — so every layout and height check passed while the site still looked wrong.

### Screenshot diff — final state

Every remaining difference is accounted for:

| Page                   | Δheight  | diff%          | Why                                                                         |
| ---------------------- | -------- | -------------- | --------------------------------------------------------------------------- |
| `kitchensink`          | **+680** | 17–22%         | GFM now renders tables, footnotes, task lists (decided in Phase 0)          |
| `post-code-titles`     | −98      | 12–16%         | Shiki vs Prism token markup                                                 |
| `post-images`          | −108     | 7–8%           | Shiki, plus WebP images at slightly different intrinsic sizes               |
| `archive-post`         | −12      | 8.5%           | **the title-size normalisation** — verified visually as the only difference |
| `post-sidenote`        | −72      | 6%             | Shiki                                                                       |
| `post-line-highlight`  | +18      | 5–6%           | Shiki line-highlight bands                                                  |
| `post-sidenote-series` | +6       | 5%             | Shiki                                                                       |
| six index/topic pages  | **0**    | **0.00–0.04%** | three are pixel-identical after the font-smoothing fix below                |

Article pages carry a 5–8% pixel difference because **syntax highlighting is a different
engine**: Shiki's token boundaries and therefore its coloured spans do not line up with
Prism's, even though the palettes were ported. That was accepted in Phase 1B.

### Differences that are correct and must NOT be chased

1. **`robots.txt` has no `Disallow: /` locally.** `next-sitemap` ran with `NODE_ENV`
   unset; Astro builds with `NODE_ENV=production`. On Vercel the deciding variable is
   `VERCEL_ENV`, which is correct in both cases.
2. **Feed `pubDate`s shift by the timezone offset.** Local midnight → UTC midnight; the
   candidate now matches the frontmatter date exactly where the baseline could show the
   previous day.
3. **`sitemap-index.xml` is one extra generated file.** Unreferenced; not configurable
   away.
4. **`&#x27;` vs `&#39;`** in two archive `<title>`s — the same apostrophe, hex versus
   decimal entity encoding.
5. **All markup differs.** Chakra/Emotion class names are gone. Checksums were only ever
   for spotting missing or added URLs.

**Exit criteria:** met.

---

## Phase 9 — Cutover

- [ ] Delete `next.config.js`, `next-sitemap.config.js`, `pages/`, `patches/`,
      `next-env.d.ts`
- [ ] Prune `package.json` (~55 deps → ~12)
- [ ] Rename the package from `with-typescript` (leftover from the Next starter)
- [ ] Update `CLAUDE.md` — most of it describes the old pipeline
- [ ] Deploy to a Vercel preview; verify against production with real DNS
- [ ] Merge, then watch for 404s in Vercel analytics for a week

---

## Pre-existing issues found during the audit

Decide intent for each; don't port a bug by accident.

1. ~~**`components/SideNote.tsx:67`**~~ — ✅ **resolved in Phase 3.** `green.333` is not a
   Chakra step, so the declaration is invalid and dark-mode success notes currently fall
   back to `currentColor`. Ported as `green.200`; intentional dark-mode diff.
2. ~~**Colour-mode config mismatch**~~ — ✅ **resolved in Phase 3: follow the system
   preference**, with a manual toggle that overrides and persists.
3. **`lib/topics.ts:40`** — stray `console.log(data)`.
4. **`pages/[topic].tsx`** — `new Date().toISOString()` as the article date.
5. **`lib/feeds.tsx:54`** — feed titles are **double-title-cased**. `makeTitle()` is
   called without `TITLE_OPTIONS` on an already-title-cased string, so acronyms are
   destroyed: subscribers get `Aws Iam Demystified`, the site shows `AWS IAM Demystified`.
   Confirmed in the 1A spike. Fix during the port.
6. ~~**Dead code**~~ — resolved by the GFM decision: `MDXComponents.tsx`'s eight table
   mappings and `styles/components.ts`'s `Table` baseStyle stop being dead and get
   ported and tested against `_kitchensink`.
7. **Two broken links in archive content**, found while classifying image references
   in Phase 4. Neither is caused by the migration and neither is fixed by it:
    - `archive/statserver-…mdx:93` links to `/archive-assetssetting-up-sentry-using-vagrant-and-puppet.md`
      — a missing slash _and_ a stale `.md` extension. Probably meant
      `/archive/setting-up-sentry-using-vagrant-and-puppet`.
    - `archive/my-new-website-is-finally-live.mdx` links to `/contact`, which is not in
      the URL inventory and 404s.

8. **🐞 The JSON feed advertises a favicon that does not exist.** `lib/feeds.tsx:23` sets
   `favicon: ${baseUrl}/favicons/banner.png`, but `public/favicons/` contains no
   `banner.png` (the banner lives at `public/images/banner.png`). Decide in Phase 7
   whether to point it at the real banner or at an actual favicon.

9. ~~**Heading title-casing deletes spaces around inline markup**~~ — ✅ **fixed in
   Phase 4.** `remark-capitalize` trimmed every text node inside a heading, so
   `## Help! [My girlfriend](…) can't choose…` rendered as
   `Help!My GirlfriendCan't Choose…`. The trim is gone; see Phase 4 finding 2 for why
   that is the correct fix rather than a workaround.

10. **48.3 MB of unreferenced files in `public/archive-assets/files/`** — `sf2hadoop.jar`
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
