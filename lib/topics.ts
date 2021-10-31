import { getPostsFrontMatter, PartialFrontMatter } from '@/lib/posts';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import fs from 'fs';
import { contentPath } from '@/lib/content-utils';
import serializePost from '@/lib/mdx';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';

export type TopicData = {
    mdxSource: MDXRemoteSerializeResult;
    title?: string;
};

export const getAllTopics = (limit?: number): Map<string, PartialFrontMatter[]> => {
    const posts = getPostsFrontMatter('writings');
    const topicsWithPosts = posts.reduce((acc, post) => {
        post.topics?.forEach((t) => {
            if (!acc.has(t)) {
                acc.set(t, new Array<PartialFrontMatter>());
            }
            acc.get(t).push(post);
        });
        return acc;
    }, new Map<string, PartialFrontMatter[]>());
    const sortedAndSliced: [string, PartialFrontMatter[]][] = Array.from(topicsWithPosts).map(
        ([key, value]) => {
            value.sort(
                (a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime()
            );
            if (limit) {
                return [key, value.slice(0, limit)];
            } else {
                return [key, value];
            }
        }
    );
    return new Map(sortedAndSliced);
};

export const getTopicPreamble = async (topic: string): Promise<TopicData | null> => {
    const path = contentPath('topics', `${topic}.mdx`);
    if (fs.existsSync(path)) {
        const source = fs.readFileSync(path, 'utf-8');
        const { data, content } = matter(source);
        console.log(data);
        const mdxSource = await serializePost(content);
        return {
            mdxSource: mdxSource,
            title: data.title ?? null,
        };
    } else {
        return null;
    }
};
