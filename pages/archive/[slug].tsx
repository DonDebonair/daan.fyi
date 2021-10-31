import { GetStaticPaths, GetStaticProps } from 'next';
import { MDXComponents } from '@/components/MDXComponents';
import { MDXRemote } from 'next-mdx-remote';
import { Avatar, Flex, Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { getAndSerializePost, getPosts, PostData } from '@/lib/posts';

const ArticlePage = ({ mdxSource, frontMatter }: PostData): ReactNode => {
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
                <Flex direction="row">
                    <Avatar src="/images/daan.png" size="xs" name="Daan Debie" mr={2} />
                    <Text fontSize="md">
                        {'Daan Debie / '}
                        {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
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
    const { mdxSource, frontMatter } = await getAndSerializePost('archive', params.slug as string);
    return {
        props: {
            mdxSource,
            frontMatter,
        },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = getPosts('archive');

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
