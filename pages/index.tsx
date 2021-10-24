import { Heading, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { GetStaticProps } from 'next';
import { StylishLink } from '@/components/CustomLink';
import { generateMainFeeds } from '@/lib/feeds';
import { getPostsFrontMatter, PartialFrontMatter } from '@/lib/posts';
import PostsList from '@/components/PostsList';

type HomePageProps = {
    lastPosts: PartialFrontMatter[];
};

const HomePage = ({ lastPosts }: HomePageProps): ReactNode => (
    <DefaultLayout title="Home | Daan Debie">
        <Heading as="h1" size="2xl">
            Howdy! I‘m Daan.
        </Heading>

        <Text fontSize="lg">
            I‘m a social code grower, firestarter, software smith, music maniac and general nice
            guy. I work as VP of Engineering at{' '}
            <StylishLink href="https://source.ag">Source.ag</StylishLink> where I help accelerate
            the global transition to sustainable agriculture with A.I. powered greenhouses.
        </Text>
        <Text fontSize="lg">
            This is my little oasis from where I shout into the digital desert.
        </Text>

        <Heading as="h2" size="xl">
            Recent posts
        </Heading>
        <PostsList posts={lastPosts} />
    </DefaultLayout>
);

export const getStaticProps: GetStaticProps = () => {
    generateMainFeeds();
    const lastPosts = getPostsFrontMatter('writings', 3);
    return {
        props: {
            lastPosts,
        },
    };
};

export default HomePage;
