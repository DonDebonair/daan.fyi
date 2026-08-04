import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { parseISO } from 'date-fns';
import readingTime from 'reading-time';
import titleCase from './titleCase';

export type PostCollection = 'writings' | 'archive' | 'special';
export type Post<C extends PostCollection = PostCollection> = CollectionEntry<C>;

export type SimplePost = {
    title: string;
    slug: string;
    publishedAt: string;
};

export type SeriesData = {
    title: string;
    collection: PostCollection;
    posts: SimplePost[];
};

/**
 * Post titles are title-cased in JS, separately from the headings inside the MDX body
 * (which `remark-title-case` handles). Both mechanisms existed in the Chakra version and
 * both have to survive — see `lib/posts.ts:68` in the old tree.
 */
export const postTitle = (entry: Post): string => titleCase(entry.data.title);

const byNewestFirst = (a: Post, b: Post) =>
    parseISO(b.data.publishedAt).getTime() - parseISO(a.data.publishedAt).getTime();

export const getSortedPosts = async <C extends PostCollection>(
    collection: C,
    limit?: number
): Promise<CollectionEntry<C>[]> => {
    const posts = await getCollection(collection as CollectionKey);
    const sorted = (posts as CollectionEntry<C>[]).sort(byNewestFirst);
    return limit ? sorted.slice(0, limit) : sorted;
};

/**
 * Word count and reading time are both derived from the **raw MDX body**, exactly as
 * before — `entry.body` is the post-frontmatter source, which is what `content` was in
 * the old `getAndSerializePost`.
 */
export const postStats = (entry: Post): { wordCount: number; readingTime: string } => {
    const body = entry.body ?? '';
    return {
        wordCount: body.split(/\s+/gu).length,
        readingTime: readingTime(body).text,
    };
};

/** Posts sharing a `series` value, oldest-first, for the SeriesOverview box. */
export const getSeriesData = async (
    collection: PostCollection,
    series: string
): Promise<SeriesData> => {
    const posts = await getSortedPosts(collection);
    const inSeries = posts
        .filter((p) => p.data.series != null && p.data.series === series)
        .map((p) => ({
            title: postTitle(p),
            slug: p.id,
            publishedAt: p.data.publishedAt,
        }))
        .sort((a, b) => parseISO(a.publishedAt).getTime() - parseISO(b.publishedAt).getTime());

    return { title: titleCase(series), collection, posts: inSeries };
};
