import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import mdxPrism from 'mdx-prism';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkCodeTitles from 'remark-code-titles';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import readingTime from 'reading-time';
import { parseISO } from 'date-fns';

const CONTENT_DIR = 'content';

const root = process.cwd();

export type FrontMatter = {
    wordCount: number;
    slug: string;
    title: string;
    publishedAt: string;
    readingTime: string;
    [key: string]: string | number | boolean;
};

export type PostData = {
    mdxSource: MDXRemoteSerializeResult;
    frontMatter: FrontMatter;
};

const getPost = (type: string, slug: string): matter.GrayMatterFile<string> => {
    const postSource = fs.readFileSync(path.join(root, CONTENT_DIR, type, `${slug}.mdx`), 'utf8');
    return matter(postSource);
};

export const getAndSerializePost = async (type: string, slug: string): Promise<PostData> => {
    const { data, content } = getPost(type, slug);
    const mdxSource = await serialize(content, {
        mdxOptions: {
            remarkPlugins: [remarkCodeTitles],
            rehypePlugins: [mdxPrism, rehypeSlug, rehypeAutolinkHeadings],
        },
    });
    return {
        mdxSource,
        frontMatter: {
            wordCount: content.split(/\s+/gu).length,
            slug: slug,
            title: data.title,
            publishedAt: data.publishedAt,
            readingTime: readingTime(content).text,
            ...data,
        },
    };
};

export const getPosts = (type: string): string[] =>
    fs.readdirSync(path.join(root, CONTENT_DIR, type));

export const getAllPostsFrontMatter = (type: string, limit?: number): Partial<FrontMatter>[] => {
    const posts = getPosts(type);
    const sortedFrontmatter = posts
        .map((fileName) => {
            const slug = fileName.replace('.mdx', '');
            const { data } = getPost(type, slug);
            return {
                slug: slug,
                title: data.title,
                publishedAt: data.publishedAt,
            };
        })
        .sort((a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime());
    if (limit) {
        return sortedFrontmatter.slice(0, limit);
    } else {
        return sortedFrontmatter;
    }
};
