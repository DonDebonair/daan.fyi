// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { transformerMetaHighlight } from '@shikijs/transformers';

import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkTextr from 'remark-textr';
import remarkUnwrapImages from 'remark-unwrap-images';
import apostrophes from 'typographic-apostrophes';
import apostrophesForPlurals from 'typographic-apostrophes-for-possessive-plurals';
import arrows from 'typographic-arrows';
import copyright from 'typographic-copyright';
import ellipses from 'typographic-ellipses';
import emDashes from 'typographic-em-dashes';
import enDashes from 'typographic-en-dashes';
import mathSymbols from 'typographic-math-symbols';
import quotes from 'typographic-quotes';
import registeredTrademark from 'typographic-registered-trademark';
import singleSpaces from 'typographic-single-spaces';
import trademark from 'typographic-trademark';

import { baseUrl } from './src/lib/config';
import { remarkTitleCase } from './src/plugins/remark-title-case';
import { transformerCodeTitle } from './src/plugins/transformer-code-title.mjs';
import lightTheme from './src/shiki/prism-default-light.json' with { type: 'json' };
import darkTheme from './src/shiki/night-owl-pink.json' with { type: 'json' };

/**
 * These casts paper over genuine ecosystem type skew, not over unsound code — every one
 * is verified working in the build. `remark-unwrap-images`, `remark-textr` and
 * `rehype-autolink-headings` ship types built against a different unified/mdast release
 * than Astro's, so their `Transformer<Root, Root>` is nominally incompatible with
 * Astro's `RemarkPlugin`/`RehypePlugin`. The Chakra tree hit the same wall and used
 * `@ts-ignore` for it.
 *
 * @type {any[]}
 */
const remarkPlugins = [
    remarkUnwrapImages,
    remarkTitleCase,
    [
        remarkTextr,
        {
            plugins: [
                apostrophes,
                quotes,
                apostrophesForPlurals,
                arrows,
                copyright,
                ellipses,
                emDashes,
                enDashes,
                mathSymbols,
                registeredTrademark,
                singleSpaces,
                trademark,
            ],
        },
    ],
];

/**
 * `rehypeHeadingIds` is Astro's own slugger, replacing `rehype-slug`. It has to be listed
 * explicitly: Astro otherwise runs it *after* user plugins, so `rehype-autolink-headings`
 * would find no ids to link and silently do nothing.
 *
 * @type {any[]}
 */
const rehypePlugins = [rehypeHeadingIds, rehypeAutolinkHeadings];

/**
 * TypeScript widens the themes' `"type": "light"` to `string` when importing JSON, which
 * does not satisfy Shiki's `ThemeRegistration`.
 *
 * @type {any}
 */
const shikiThemes = { light: lightTheme, dark: darkTheme };

// https://astro.build/config
export default defineConfig({
    site: baseUrl,

    // Phase 0 established that canonical URLs carry no trailing slash — /writings/rss/
    // 308s to /writings/rss. `format: 'file'` emits about.html rather than about/index.html,
    // which is what makes the extensionless, slashless URL the canonical one.
    trailingSlash: 'never',
    build: { format: 'file' },

    integrations: [
        mdx(),
        sitemap({
            // `next-sitemap` skipped underscore-prefixed paths as internal, so
            // `/_kitchensink` was never in the sitemap. It is a deliberately unlinked
            // styling test page — publishing it to search engines would be a regression,
            // not a bonus. Astro has no such rule, so the exclusion is explicit.
            filter: (page) => !page.includes('/_kitchensink'),

            // `changefreq: 'monthly'` was set in next-sitemap.config.js; `priority: 0.7`
            // was its default and appeared on every URL in the baseline.
            //
            // `lastmod` is deliberately NOT set. next-sitemap stamped every URL with the
            // build time, which is both meaningless (all 60 URLs shared one timestamp)
            // and non-reproducible — the same reason the build-time `date` was dropped
            // from /topics and /[topic] in Phase 6.
            changefreq: 'monthly',
            priority: 0.7,
        }),
    ],

    vite: { plugins: [tailwindcss()] },

    markdown: {
        // Astro 7 made the Markdown engine pluggable. `markdown.gfm`, `.smartypants`,
        // `.remarkPlugins`, `.rehypePlugins` and `.remarkRehype` are all deprecated at
        // this level and must be passed to the processor instead. `shikiConfig` and
        // `syntaxHighlight` are NOT deprecated and stay here.
        processor: unified({
            // GFM stays at Astro's default (on) — decided in Phase 0, finding 3.

            // SmartyPants is on by default and fights the remark-textr stack: it
            // produces en dashes where the original has em dashes, and curls quotes the
            // original leaves straight. See MIGRATION.md, Phase 1A finding 2.
            smartypants: false,

            // Order is load-bearing and reproduces the original pipeline exactly:
            // unwrap images, then title-case headings, then typographic substitutions.
            remarkPlugins,
            rehypePlugins,
        }),

        shikiConfig: {
            // Hand-ported from Prism's default palette and Night Owl, with the three
            // #FFA7C4 overrides. Each theme carries a `_comment` explaining why the
            // `variable` scope is deliberately narrow; see MIGRATION.md, Phase 1B.
            themes: shikiThemes,

            // Prism accepted `apacheconf`; Shiki calls it `apache` and would otherwise
            // fall back to plaintext without warning.
            langAlias: { apacheconf: 'apache' },

            // Emits --shiki-light / --shiki-dark per span instead of baking one theme
            // in, which reduces the whole light/dark mechanism to a few CSS rules.
            // ⚠️ Set the background on the block only, never on the spans — see
            // src/styles/article.css.
            defaultColor: false,

            transformers: [transformerMetaHighlight(), transformerCodeTitle()],
        },
    },
});
