import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer } from 'astro/container';
import mdxRenderer from '@astrojs/mdx/server.js';
import { Feed } from 'feed';
import fs from 'node:fs';
import SideNote from '@/components/SideNote.astro';
import Asterisk from '@/components/Asterisk.astro';
import Small from '@/components/Small.astro';

const baseUrl = 'https://www.daan.fyi';

export const GET: APIRoute = async () => {
    const container = await experimental_AstroContainer.create();
    // Renderers must be registered manually when the container runs outside a page render.
    container.addServerRenderer({ name: '@astrojs/mdx', renderer: mdxRenderer });

    const feed = new Feed({
        title: 'Daan Debie',
        description: 'This is a feed of all posts on the website of Daan Debie',
        id: `${baseUrl}/`,
        link: `${baseUrl}/`,
        language: 'en',
        image: `${baseUrl}/images/banner.png`,
        favicon: `${baseUrl}/favicons/banner.png`,
        copyright: 'Copyright 2026 - Daan Debie',
        generator: 'Astro + feed package',
        feedLinks: {
            json: `${baseUrl}/feeds/feed.json`,
            atom: `${baseUrl}/feeds/atom.xml`,
            rss2: `${baseUrl}/feeds/feed.xml`,
        },
        author: { name: 'Daan Debie', email: 'daan@dv.email', link: baseUrl },
    });

    const posts = await getCollection('writings');
    posts.sort(
        (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
    );

    for (const post of posts) {
        const { Content } = await render(post);
        const raw = await container.renderToString(Content, {
            props: { components: { SideNote, Asterisk, Small } },
        });
        const url = `${baseUrl}/writings/${post.id}`;
        // Same rewrites the Next implementation did in lib/feeds.tsx
        const html = raw
            .replace(/href="\/#/g, `href="${url}#`)
            .replace(/href="\//g, `href="${baseUrl}/`)
            .replace(/src="\//g, `src="${baseUrl}/`);
        feed.addItem({
            title: post.data.title,
            link: url,
            id: url,
            date: new Date(post.data.publishedAt),
            description: post.data.summary,
            content: html,
        });
    }

    // Spike only: emit all three formats from one route so we can inspect them together.
    fs.mkdirSync('dist/feeds', { recursive: true });
    fs.writeFileSync('dist/feeds/atom.xml', feed.atom1());
    fs.writeFileSync('dist/feeds/feed.json', feed.json1());

    return new Response(feed.rss2(), { headers: { 'Content-Type': 'application/xml' } });
};
