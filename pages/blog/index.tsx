import CustomLink from '@/components/CustomLink';
import { Flex, Heading, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import { GetStaticProps } from 'next';
import { FrontMatter, getAllPostsFrontMatter } from '@/lib/mdx';

type BlogOverviewProps = {
    allPosts: Partial<FrontMatter>[];
};

const BlogOverviewPage = ({ allPosts }: BlogOverviewProps): ReactNode => (
    <DefaultLayout title="Blog | Daan Debie">
        <Heading as="h1" size="2xl">
            Blog
        </Heading>
        <Text fontSize="md">These are some of my writings</Text>
        {allPosts.map((frontMatter) => {
            return (
                <Flex key={frontMatter.slug} direction="column">
                    <CustomLink href={`/blog/${frontMatter.slug}`}>
                        <Heading as="h3" size="sm" mb={2}>
                            {frontMatter.title}
                        </Heading>
                    </CustomLink>
                    <Text>{frontMatter.publishedAt}</Text>
                </Flex>
            );
        })}
    </DefaultLayout>
);

export const getStaticProps: GetStaticProps = () => {
    const allPosts = getAllPostsFrontMatter('blog');
    return {
        props: {
            allPosts,
        },
    };
};

export default BlogOverviewPage;
