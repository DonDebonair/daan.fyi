import { Feed } from 'feed';
import { experimental_AstroContainer } from 'astro/container';
import mdxRenderer from '@astrojs/mdx/server.js';
import { getCollection, render } from 'astro:content';
import { stripHtml } from 'string-strip-html';
import { mdxComponents } from '@/components/mdx/components';
import { baseUrl, copyright } from '@/lib/config';
import { postTitle } from '@/lib/posts';

/**
 * Builds the feed once and serves all three formats from it.
 *
 * Replaces `lib/feeds.tsx`, which ran as a side effect of the home page's
 * `getStaticProps` and wrote files into `public/`. These are real endpoints now, so the
 * home page no longer has to be built for subscribers to get anything.
 *
 * ⚠️ `experimental_AstroContainer` is experimental — the Astro version is pinned for
 * exactly this reason. See MIGRATION.md Phase 1A.
 */
let cached: Promise<Feed> | null = null;

const renderPosts = async (): Promise<Feed> => {
    const container = await experimental_AstroContainer.create();
    // Renderers must be registered by hand when the container runs outside a page render.
    // Without this you get a confusing "Expected component X to be defined".
    container.addServerRenderer({ name: '@astrojs/mdx', renderer: mdxRenderer });

    const feed = new Feed({
        title: 'Daan Debie',
        description: 'This is a feed of all posts on the website of Daan Debie',
        id: `${baseUrl}/`,
        link: `${baseUrl}/`,
        language: 'en',
        image: `${baseUrl}/images/banner.png`,
        // Was `/favicons/banner.png`, which has never existed — see MIGRATION.md
        // pre-existing issue 8. Pointed at a real favicon rather than the banner, since
        // this field is meant to be a small icon.
        favicon: `${baseUrl}/favicons/favicon-32x32.png`,
        copyright,
        generator: 'Astro + feed package',
        feedLinks: {
            json: `${baseUrl}/feeds/feed.json`,
            atom: `${baseUrl}/feeds/atom.xml`,
            rss2: `${baseUrl}/feeds/feed.xml`,
        },
        author: {
            name: 'Daan Debie',
            email: 'daan@dv.email',
            link: 'https://www.daan.fyi',
        },
    });

    const posts = await getCollection('writings');
    posts.sort(
        (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
    );

    for (const post of posts) {
        const { Content } = await render(post);
        const raw = await container.renderToString(Content, {
            props: { components: mdxComponents },
        });

        const url = `${baseUrl}/writings/${post.id}`;
        // The same three rewrites lib/feeds.tsx did: relative URLs are meaningless once
        // the content is sitting in someone's feed reader.
        const absolute = raw
            .replace(/href="\/#/g, `href="${url}#`)
            .replace(/href="\//g, `href="${baseUrl}/`)
            .replace(/src="\//g, `src="${baseUrl}/`);

        // Astro emits scoped <style> blocks for component styles (SideNote has one), so
        // this is doing real work, not just carrying a habit across.
        const content = stripHtml(absolute, {
            onlyStripTags: ['script', 'style'],
            stripTogetherWithTheirContents: ['script', 'style'],
        }).result;

        feed.addItem({
            // 🐞 `lib/feeds.tsx:54` called makeTitle() WITHOUT TITLE_OPTIONS on a string
            // that was already title-cased, which destroyed the acronym exceptions —
            // subscribers got "Aws Iam Demystified" while the site showed "AWS IAM
            // Demystified". `postTitle` applies the options exactly once.
            title: postTitle(post),
            link: url,
            id: url,
            // `new Date(...)` on a date-only string is UTC by spec. The old code used
            // date-fns `parseISO`, which resolves to *local* midnight — so feed dates
            // shifted with the build machine's timezone. See MIGRATION.md Phase 7.
            date: new Date(post.data.publishedAt),
            description: post.data.summary,
            content,
        });
    }

    return feed;
};

export const getFeed = (): Promise<Feed> => (cached ??= renderPosts());
