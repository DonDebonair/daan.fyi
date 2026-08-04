import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Replaces the hand-rolled readers in `lib/posts.ts` and the `ContentType` union in
 * `lib/content-utils.ts`. The filename is still the slug.
 *
 * `publishedAt` stays a **string**, not `z.coerce.date()`. The frontmatter holds
 * `'2022-03-21'`, which is what `<meta property="article:published_time">` and the feeds
 * emit verbatim today; coercing to a Date and re-serialising would produce
 * `2022-03-21T00:00:00.000Z` and change every page.
 */
const postSchema = z.object({
    title: z.string(),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected an ISO date, e.g. 2022-03-21'),
    summary: z.string().optional(),
    topics: z.array(z.string()).optional(),
    series: z.string().optional(),
});

const writings = defineCollection({
    loader: glob({ base: './src/content/writings', pattern: '**/*.mdx' }),
    schema: postSchema,
});

const archive = defineCollection({
    loader: glob({ base: './src/content/archive', pattern: '**/*.mdx' }),
    schema: postSchema,
});

const special = defineCollection({
    // The leading underscore in `_kitchensink.mdx` is deliberate — it keeps the styling
    // test page unlinked. The glob loader skips underscore-prefixed files by default, so
    // the pattern has to ask for them explicitly or the page disappears.
    loader: glob({ base: './src/content/special', pattern: ['**/*.mdx', '**/_*.mdx'] }),
    schema: postSchema,
});

export const collections = { writings, archive, special };
