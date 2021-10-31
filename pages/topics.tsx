import { GetStaticProps } from 'next';
import { getAllTopics } from '@/lib/topics';
import { PartialFrontMatter } from '@/lib/posts';
import React, { ReactNode } from 'react';
import DefaultLayout from '@/layouts/DefaultLayout';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { PostSummaryList } from '@/components/PostsList';
import { DefaultLink } from '@/components/CustomLink';

type TopicsProps = {
    topics: [string, PartialFrontMatter[]][];
};

const TopicsPage = ({ topics }: TopicsProps): ReactNode => {
    return (
        <DefaultLayout title={'Topics | Daan Debie'} date={new Date().toISOString()} type="article">
            {topics.map(([topic, posts]) => {
                return (
                    <Flex
                        key={topic}
                        direction="column"
                        maxWidth="800px"
                        w="100%"
                        m="0 auto 0 auto"
                    >
                        <DefaultLink href={`/topics/${topic}`}>
                            <Heading as="h2" fontSize="lg" mb={3}>
                                {topic}
                            </Heading>
                        </DefaultLink>
                        <PostSummaryList posts={posts} />
                    </Flex>
                );
            })}
        </DefaultLayout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const topicsWithPosts = getAllTopics(3);
    return {
        props: {
            topics: Array.from(topicsWithPosts),
        },
    };
};

export default TopicsPage;
