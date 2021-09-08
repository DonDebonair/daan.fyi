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
    <DefaultLayout title="Archive | Daan Debie">
        <Heading as="h1" size="xl">
            Archive
        </Heading>
        <Text>
            These are older articles that I wrote for previous incarnations of my blog that used to
            live at DandyDev.net. These articles do not represent my current interests, skills and
            who I am anymore, but I leave them here for historical context.
        </Text>
        {allPosts.map((frontMatter) => {
            return (
                <Flex key={frontMatter.slug} direction="column">
                    <DefaultLink href={`/archive/${frontMatter.slug}`}>
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
    const allPosts = getAllPostsFrontMatter('archive');
    return {
        props: {
            allPosts,
        },
    };
};

export default BlogOverviewPage;
