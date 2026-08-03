import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { transformerMetaHighlight } from '@shikijs/transformers';
import { transformerCodeTitle } from './src/plugins/transformer-code-title.mjs';
import lightTheme from './src/shiki/prism-default-light.json' with { type: 'json' };
import darkTheme from './src/shiki/night-owl-pink.json' with { type: 'json' };

export default defineConfig({
    integrations: [mdx()],
    markdown: {
        // Astro turns both of these ON by default. GFM would start rendering tables /
        // footnotes / task lists that currently render as literal text, and smartypants
        // conflicts with the remark-textr stack (en dash vs em dash).
        gfm: false,
        smartypants: false,
        shikiConfig: {
            themes: { light: lightTheme, dark: darkTheme },
            // Prism accepted `apacheconf`; Shiki bundles it as `apache`. Without this
            // alias the block in archive/how-to-speed-up-your-websites.mdx silently
            // falls back to plaintext.
            langAlias: { apacheconf: 'apache' },
            defaultColor: false, // emit --shiki-light / --shiki-dark vars, inline nothing
            transformers: [transformerMetaHighlight(), transformerCodeTitle()],
        },
    },
});
