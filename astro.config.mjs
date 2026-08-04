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
 * Astro's `RemarkPlugin`/`RehypePlugin`. The Chakra tree had the same problem and used
 * `@ts-ignore` in `lib/mdx.ts`.
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

    integrations: [mdx(), sitemap()],

    vite: { plugins: [tailwindcss()] },

    markdown: {
        // Astro 7 made the Markdown engine pluggable. `markdown.gfm`, `.smartypants`,
        // `.remarkPlugins`, `.rehypePlugins` and `.remarkRehype` are all deprecated at
        // this level and must be passed to the processor instead. `shikiConfig` and
        // `syntaxHighlight` are NOT deprecated and stay here.
        processor: unified({
            // GFM stays at Astro's default (on) — decided in Phase 0, finding 3.

            // SmartyPants is on by default and fights the remark-textr stack: the 1A
            // spike produced en dashes where the baseline has em dashes, and curled
            // quotes the baseline leaves straight. See MIGRATION.md, Phase 1A finding 2.
            smartypants: false,

            // Order matters and mirrors lib/mdx.ts exactly.
            remarkPlugins,
            rehypePlugins,
        }),

        shikiConfig: {
            // Hand-ported in the 1B spike: Prism's default palette and Night Owl with the
            // three #FFA7C4 overrides. See spike/README.md for why `variable` is scoped
            // narrowly.
            themes: shikiThemes,

            // Prism accepted `apacheconf`; Shiki calls it `apache` and would otherwise
            // fall back to plaintext without warning.
            langAlias: { apacheconf: 'apache' },

            // Emits --shiki-light / --shiki-dark per span instead of baking one theme in,
            // which turns the whole light/dark mechanism into six lines of CSS.
            defaultColor: false,

            transformers: [transformerMetaHighlight(), transformerCodeTitle()],
        },
    },
});
