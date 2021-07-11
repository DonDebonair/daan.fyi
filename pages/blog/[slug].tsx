import { GetStaticPaths, GetStaticProps } from 'next';
import { getAndSerializePost, getPosts, PostData } from '@/lib/mdx';
import { MDXComponents } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote';
import { Flex, Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';

const BlogPage = ({ mdxSource, frontMatter }: PostData): ReactNode => {
    return (
        <DefaultLayout
            as="article"
            title={`${frontMatter.title} | Daan Debie`}
            date={new Date(frontMatter.publishedAt).toISOString()}
            type="article"
        >
            <Heading as="h1" size="2xl">
                {frontMatter.title}
            </Heading>
            <Flex
                justify="space-between"
                align={['initial', 'center']}
                direction={['column', 'row']}
                mt={2}
                w="100%"
                mb={4}
            >
                <Flex align="center">
                    <Text fontSize="md">
                        {'Daan Debie / '}
                        {frontMatter.publishedAt}
                    </Text>
                </Flex>
                <Text fontSize="md" color="gray.500" minWidth="100px" mt={[2, 0]}>
                    {frontMatter.readingTime}
                </Text>
            </Flex>
            <MDXRemote {...mdxSource} components={MDXComponents} />
        </DefaultLayout>
    );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { mdxSource, frontMatter } = await getAndSerializePost('blog', params.slug as string);
    return {
        props: {
            mdxSource,
            frontMatter,
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getPosts('blog');

    return {
        paths: posts.map((p) => ({
            params: {
                slug: p.replace(/\.mdx/, ''),
            },
        })),
        fallback: false,
    };
};

export default BlogPage;
