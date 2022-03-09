import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXComponents } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote';
import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { getAndSerializePost, getPosts, PostData } from '@/lib/posts';
import TopicBadge from '@/components/TopicBadge';
import SeriesOverview from '@/components/SeriesOverview';

const ArticlePage = ({ mdxSource, frontMatter, seriesData }: PostData): ReactNode => {
    return (
        <DefaultLayout
            as="article"
            title={`${frontMatter.title} | Daan Debie`}
            date={new Date(frontMatter.publishedAt).toISOString()}
            type="article"
        >
            <Heading as="h1" size="xl">
                {frontMatter.title}
            </Heading>
            <Flex
                justify="space-between"
                align={['initial', 'center']}
                direction={['column', 'row']}
                mt={2}
                w="100%"
            >
                <Flex direction="row">
                    <Avatar src="/images/daan.png" size="xs" name="Daan Debie" mr={2} />
                    <Text fontSize="sm" mb={0}>
                        {'Daan Debie / '}
                        {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
                    </Text>
                </Flex>
                <Text fontSize="sm" mb={0} color="gray.500" minWidth="100px" mt={[2, 0]}>
                    {frontMatter.readingTime}
                </Text>
            </Flex>
            <Flex direction="row" mb={4}>
                {frontMatter.topics.map((t) => (
                    <TopicBadge key={t} topic={t} />
                ))}
            </Flex>
            {frontMatter.series ? (
                <SeriesOverview
                    title={seriesData.title}
                    posts={seriesData.posts}
                    currentSlug={frontMatter.slug}
                />
            ) : null}

            <MDXRemote {...mdxSource} components={MDXComponents} />
        </DefaultLayout>
    );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { mdxSource, frontMatter, seriesData } = await getAndSerializePost(
        'writings',
        params.slug as string,
        true
    );
    return {
        props: {
            mdxSource,
            frontMatter,
            seriesData,
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = getPosts('writings');

    return {
        paths: posts.map((p) => ({
            params: {
                slug: p.slug,
            },
        })),
        fallback: false,
    };
};

export default ArticlePage;
