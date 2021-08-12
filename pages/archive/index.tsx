import CustomLink from '@/components/CustomLink';
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
        <Heading as="h1" size="2xl">
            Archive
        </Heading>
        <Text fontSize="lg">
            These are older articles that I wrote for previous incarnations of my blog that used to
            live at DandyDev.net. These articles do not represent my current interests, skills and
            who I am anymore, but I leave them here for historical context.
        </Text>
        {allPosts.map((frontMatter) => {
            return (
                <Flex key={frontMatter.slug} direction="column">
                    <CustomLink href={`/archive/${frontMatter.slug}`}>
                        <Heading as="h2" size="md" mb={2}>
                            {frontMatter.title}
                        </Heading>
                    </CustomLink>
                    <Text>{format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}</Text>
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
