import { Heading, Text } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import { GetStaticProps } from 'next';
import { getPostsFrontMatter, PartialFrontMatter } from '@/lib/posts';
import PostsList from '@/components/PostsList';
import { StylishLink } from '@/components/CustomLink';

type WritingsOverviewProps = {
    allPosts: PartialFrontMatter[];
};

const WritingsOverviewPage = ({ allPosts }: WritingsOverviewProps): ReactNode => (
    <DefaultLayout title="Blog | Daan Debie">
        <Heading as="h1" size="xl">
            Writings
        </Heading>
        <Text>
            These are some of my writings. You can also{' '}
            <StylishLink href="/topics">browse them by topic.</StylishLink>
        </Text>
        <PostsList posts={allPosts} />
    </DefaultLayout>
);

export const getStaticProps: GetStaticProps = () => {
    const allPosts = getPostsFrontMatter('writings');
    return {
        props: {
            allPosts,
        },
    };
};

export default WritingsOverviewPage;
