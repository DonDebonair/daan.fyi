import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';
import mdxPrism from 'mdx-prism';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkCodeTitles from 'remark-code-titles';
import remarkCapitalize from 'remark-capitalize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import readingTime from 'reading-time';
import { parseISO } from 'date-fns';
import makeTitle from 'title';
import remarkTextr from 'remark-textr';
import apostrophes from 'typographic-apostrophes';
import quotes from 'typographic-quotes';
import apostrophesForPlurals from 'typographic-apostrophes-for-possessive-plurals';
import arrows from 'typographic-arrows';
import copyright from 'typographic-copyright';
import ellipses from 'typographic-ellipses';
import emDashes from 'typographic-em-dashes';
import enDashes from 'typographic-en-dashes';
import mathSymbols from 'typographic-math-symbols';
import registeredTrademark from 'typographic-registered-trademark';
import singleSpaces from 'typographic-single-spaces';
import trademark from 'typographic-trademark';
import imageSize from 'rehype-img-size';
import remarkUnwrapImages from 'remark-unwrap-images';

const CONTENT_DIR = 'content';
const TITLE_OPTIONS = { special: ['PS', 'OCJP', 'VPS', 'VirtPHP', 'NextJS', 'AWS', 'RSS'] };

const root = process.cwd();

export type FrontMatter = {
    wordCount: number;
    slug: string;
    title: string;
    publishedAt: string;
    readingTime: string;
    summary?: string;
    [key: string]: string | number | boolean;
};

export type PostFile = {
    fileName: string;
    slug: string;
};

export type PostData = {
    mdxSource: MDXRemoteSerializeResult;
    frontMatter: FrontMatter;
};

const getPost = (type: string, slug: string): matter.GrayMatterFile<string> => {
    const postSource = fs.readFileSync(path.join(root, CONTENT_DIR, type, `${slug}.mdx`), 'utf8');
    return matter(postSource);
};

const serializePost = async (content: string): Promise<MDXRemoteSerializeResult> => {
    return await serialize(content, {
        mdxOptions: {
            remarkPlugins: [
                remarkUnwrapImages,
                remarkCodeTitles,
                [remarkCapitalize, TITLE_OPTIONS],
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
            ],
            rehypePlugins: [
                mdxPrism,
                rehypeSlug,
                rehypeAutolinkHeadings,
                [imageSize, { dir: 'public' }],
            ],
        },
    });
};

export const getAndSerializePost = async (type: string, slug: string): Promise<PostData> => {
    const { data, content } = getPost(type, slug);
    const { title, publishedAt, summary, ...rest } = data;
    const mdxSource = await serializePost(content);
    return {
        mdxSource,
        frontMatter: {
            wordCount: content.split(/\s+/gu).length,
            slug: slug,
            title: makeTitle(title, TITLE_OPTIONS),
            publishedAt: publishedAt,
            readingTime: readingTime(content).text,
            summary: summary ?? null,
            ...rest,
        },
    };
};

export const getPosts = (type: string): PostFile[] =>
    fs.readdirSync(path.join(root, CONTENT_DIR, type)).map((fileName) => {
        return {
            fileName,
            slug: fileName.replace('.mdx', ''),
        };
    });

export const getAllPostsFrontMatter = (type: string, limit?: number): Partial<FrontMatter>[] => {
    const posts = getPosts(type);
    const sortedFrontmatter = posts
        .map((post) => {
            const { data } = getPost(type, post.slug);
            return {
                slug: post.slug,
                title: makeTitle(data.title, TITLE_OPTIONS),
                publishedAt: data.publishedAt,
                summary: data.summary ?? null,
            };
        })
        .sort((a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime());
    if (limit) {
        return sortedFrontmatter.slice(0, limit);
    } else {
        return sortedFrontmatter;
    }
};

export const getAllPosts = async (type: string, limit?: number): Promise<PostData[]> => {
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
