import { Heading, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import { GetStaticProps } from 'next';
import { getPostsFrontMatter, PartialFrontMatter } from '@/lib/posts';
import PostsList from '@/components/PostsList';

type ArchiveOverviewProps = {
    allPosts: PartialFrontMatter[];
};

const ArchiveOverviewPage = ({ allPosts }: ArchiveOverviewProps): ReactNode => (
    <DefaultLayout title="Archive | Daan Debie">
        <Heading as="h1" size="xl">
            Archive
        </Heading>
        <Text>
            These are older articles that I wrote for previous incarnations of my blog that used to
            live at DandyDev.net. These articles do not represent my current interests, skills and
            who I am anymore, but I leave them here for historical context.
        </Text>
        <PostsList prefix={'/archive'} posts={allPosts} />
    </DefaultLayout>
);

export const getStaticProps: GetStaticProps = () => {
    const allPosts = getPostsFrontMatter('archive');
    return {
        props: {
            allPosts,
        },
    };
};

export default ArchiveOverviewPage;
