import { GetStaticPaths, GetStaticProps } from 'next';
import { Box, Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { getAllTopics, getTopicPreamble, TopicData } from '@/lib/topics';
import { PartialFrontMatter } from '@/lib/posts';
import PostsList from '@/components/PostsList';
import { MDXComponents } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote';

type TopicProps = {
    topic: string;
    preamble: TopicData | null;
    posts: PartialFrontMatter[];
};

const TopicPage = ({ topic, preamble, posts }: TopicProps): ReactNode => {
    return (
        <DefaultLayout
            as="article"
            title={`${topic} | Daan Debie`}
            date={new Date().toISOString()}
            type="article"
        >
            {preamble?.title ? (
                <Heading as="h1" size="xl">
                    {preamble.title}
                </Heading>
            ) : (
                <Heading as="h1" size="xl">
                    Posts on topic:{' '}
                    <Text
                        as="span"
                        textUnderlineOffset="0.05em"
                        textDecoration="underline"
                        textDecorationStyle="dashed"
                        textDecorationThickness="0.05em"
                        textDecorationColor="teal.500"
                    >
                        {topic}
                    </Text>
                </Heading>
            )}
            {preamble ? (
                <Box mb={3}>
                    <MDXRemote {...preamble.mdxSource} components={MDXComponents} />
                </Box>
            ) : null}

            <PostsList posts={posts} />
        </DefaultLayout>
    );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const topic = params.topic as string;
    const topicsWithPosts = getAllTopics();
    const preamble = await getTopicPreamble(topic);
    return {
        props: {
            topic: topic,
            preamble: preamble,
            posts: topicsWithPosts.get(topic),
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const topicsWithPosts = getAllTopics();
    return {
        paths: [...topicsWithPosts.keys()].map((t) => ({
            params: {
                topic: t,
            },
        })),
        fallback: false,
    };
};

export default TopicPage;
