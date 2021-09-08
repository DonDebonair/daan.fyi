import { DefaultLink } from '@/components/CustomLink';
import { Flex, Heading, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import { GetStaticProps } from 'next';
import { FrontMatter, getAllPostsFrontMatter } from '@/lib/mdx';
import { format, parseISO } from 'date-fns';

type BlogOverviewProps = {
    allPosts: Partial<FrontMatter>[];
};

const BlogOverviewPage = ({ allPosts }: BlogOverviewProps): ReactNode => (
    <DefaultLayout title="Blog | Daan Debie">
        <Heading as="h1" size="xl">
            Blog
        </Heading>
        <Text>These are some of my writings</Text>
        {allPosts.map((frontMatter) => {
            return (
                <Flex key={frontMatter.slug} direction="column">
                    <DefaultLink href={`/blog/${frontMatter.slug}`}>
                        <Heading as="h2" fontSize="lg" mb={2}>
                            {frontMatter.title}
                        </Heading>
                    </DefaultLink>
                    <Text fontSize="sm">
                        {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
                    </Text>
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
