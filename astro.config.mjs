// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { baseUrl } from './src/lib/config';

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
        // `syntaxHighlight` are NOT deprecated and stay here — so the 1B spike's
        // shikiConfig drops in unchanged in Phase 4.
        processor: unified({
            // GFM stays at Astro's default (on) — decided in Phase 0, finding 3.

            // SmartyPants is on by default and fights the remark-textr stack: the 1A
            // spike produced en dashes where the baseline has em dashes, and curled
            // quotes the baseline leaves straight. See MIGRATION.md, Phase 1A finding 2.
            smartypants: false,

            // Phase 4 adds remarkPlugins (title-case, textr, unwrap-images) and
            // rehypePlugins (autolink-headings) here.
        }),
    },
});
