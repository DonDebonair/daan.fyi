import matter from 'gray-matter';
import fs from 'fs';
import titleCase from '@/lib/titleCase';
import readingTime from 'reading-time';
import { parseISO } from 'date-fns';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import serializePost from '@/lib/mdx';
import { contentPath, ContentType } from '@/lib/content-utils';

export type FrontMatter = {
    wordCount: number;
    slug: string;
    title: string;
    publishedAt: string;
    readingTime: string;
    summary?: string;
    series?: string;
    topics?: string[];
};

export type PartialFrontMatter = Pick<
    FrontMatter,
    'slug' | 'title' | 'publishedAt' | 'summary' | 'topics' | 'series'
>;

export type SimplePost = {
    title: string;
    slug: string;
    publishedAt: string;
};

export type PostFile = {
    fileName: string;
    slug: string;
};

export type SeriesData = {
    title: string;
    type: ContentType;
    posts: SimplePost[];
};

export type PostData = {
    mdxSource: MDXRemoteSerializeResult;
    frontMatter: FrontMatter;
    seriesData?: SeriesData;
};

const getPost = (type: ContentType, slug: string): matter.GrayMatterFile<string> => {
    const postSource = fs.readFileSync(contentPath(type, `${slug}.mdx`), 'utf8');
    return matter(postSource);
};

export const getAndSerializePost = async (
    type: ContentType,
    slug: string,
    includeSeriesData = false
): Promise<PostData> => {
    const { data, content } = getPost(type, slug);
    const { title, publishedAt, summary, topics, series } = data;
    const mdxSource = await serializePost(content);
    const seriesData = includeSeriesData && series ? await getSeriesData(type, series) : null;
    return {
        mdxSource,
        frontMatter: {
            wordCount: content.split(/\s+/gu).length,
            slug: slug,
            title: titleCase(title),
            publishedAt: publishedAt,
            readingTime: readingTime(content).text,
            summary: summary ?? null,
            topics: topics ?? null,
            series: series ?? null,
        },
        seriesData: seriesData,
    };
};

export const getPosts = (type: ContentType): PostFile[] =>
    fs.readdirSync(contentPath(type)).map((fileName) => {
        return {
            fileName,
            slug: fileName.replace('.mdx', ''),
        };
    });

export const getPostsFrontMatter = (type: ContentType, limit?: number): PartialFrontMatter[] => {
    const posts = getPosts(type);
    const sortedFrontmatter = posts
        .map((post) => {
            const { data } = getPost(type, post.slug);
            return {
                slug: post.slug,
                title: titleCase(data.title),
                publishedAt: data.publishedAt,
                summary: data.summary ?? null,
                topics: data.topics ?? null,
                series: data.series ?? null,
            };
        })
        .sort((a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime());
    if (limit) {
        return sortedFrontmatter.slice(0, limit);
    } else {
        return sortedFrontmatter;
    }
};

export const getPostsWithContent = async (
    type: ContentType,
    limit?: number
): Promise<PostData[]> => {
    const posts = getPosts(type);
    const serializedPosts = await Promise.all(posts.map((p) => getAndSerializePost(type, p.slug)));
    serializedPosts.sort(
        (a, b) =>
            parseISO(b.frontMatter.publishedAt).getTime() -
            parseISO(a.frontMatter.publishedAt).getTime()
    );
    if (limit) {
        return serializedPosts.slice(0, limit);
    } else {
        return serializedPosts;
    }
};

const getSeriesData = async (type: ContentType, series: string): Promise<SeriesData> => {
    const posts = getPostsFrontMatter(type);
    const postsInSeries = posts.filter((p) => p.series != null && p.series == series);
    const simplePosts = postsInSeries.map((p) => {
        return {
            title: p.title,
            slug: p.slug,
            publishedAt: p.publishedAt,
        };
    });
    simplePosts.sort(
        (a, b) => parseISO(a.publishedAt).getTime() - parseISO(b.publishedAt).getTime()
    );
    return {
        title: titleCase(series),
        type: type,
        posts: simplePosts,
    };
};
