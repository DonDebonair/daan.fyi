import { Feed, Item } from 'feed';
import { baseUrl, copyright } from '@/lib/config';
import fs from 'fs';
import ReactDOMServer from 'react-dom/server';
import makeTitle from 'title';
import { parseISO } from 'date-fns';
import { MDXComponents } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote';
import React from 'react';
import theme from '../styles/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { stripHtml } from 'string-strip-html';
import { getPostsWithContent, PostData } from '@/lib/posts';

const buildFeed = (): Feed => {
    return new Feed({
        title: 'Daan Debie',
        description: 'This is a feed of all posts on the website of Daan Debie',
        id: 'https://www.daan.fyi/',
        link: 'https://www.daan.fyi/',
        language: 'en',
        image: `${baseUrl}/images/banner.png`,
        favicon: `${baseUrl}/favicons/banner.png`,
        copyright: copyright,
        generator: 'NextJS + feed package',
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
};

const makeItem = (post: PostData): Item => {
    const url = `${baseUrl}/writings/${post.frontMatter.slug}`;
    const htmlContent = ReactDOMServer.renderToStaticMarkup(
        <ChakraProvider resetCSS theme={theme}>
            <MDXRemote {...post.mdxSource} components={MDXComponents} />
        </ChakraProvider>
    )
        .replace(/href="\/#/g, `href="${url}#`)
        .replace(/href="\//g, `href="${baseUrl}/`)
        .replace(/src="\//g, `src="${baseUrl}/`);
    const cleanHtmlContent = stripHtml(htmlContent, {
        onlyStripTags: ['script', 'style'],
        stripTogetherWithTheirContents: ['script', 'style'],
    }).result;
    return {
        title: makeTitle(post.frontMatter.title),
        link: url,
        id: url,
        date: parseISO(post.frontMatter.publishedAt),
        description: post.frontMatter.summary,
        content: cleanHtmlContent,
    };
};

export const generateMainFeeds = async (): Promise<void> => {
    const feed = buildFeed();
    const posts = await getPostsWithContent('writings');
    posts.forEach((post) => feed.addItem(makeItem(post)));
    fs.mkdirSync('public/feeds/', { recursive: true });
    fs.writeFileSync('public/feeds/feed.xml', feed.rss2());
    fs.writeFileSync('public/feeds/feed.json', feed.json1());
    fs.writeFileSync('public/feeds/atom.xml', feed.atom1());
};

export default buildFeed;
