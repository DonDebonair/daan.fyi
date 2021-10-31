import { PartialFrontMatter } from '@/lib/posts';
import { Badge, Flex, Heading, Text } from '@chakra-ui/react';
import { DefaultLink } from '@/components/CustomLink';
import { format, parseISO } from 'date-fns';
import React, { ReactElement } from 'react';
import TopicBadge from '@/components/TopicBadge';

type PostsListProps = {
    posts: PartialFrontMatter[];
};

type PostProps = {
    frontMatter: PartialFrontMatter;
};

const Post = ({ frontMatter }: PostProps): ReactElement => (
    <Flex direction="column">
        <DefaultLink href={`/writings/${frontMatter.slug}`}>
            <Heading as="h2" fontSize="lg" mb={2}>
                {frontMatter.title}
            </Heading>
        </DefaultLink>
        <Flex direction="row" mb={1}>
            {frontMatter.topics?.map((topic) => (
                <TopicBadge key={topic} topic={topic} />
            ))}
        </Flex>
        <Text fontSize="sm">{format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}</Text>
    </Flex>
);

const PostSummary = ({ frontMatter }: PostProps): ReactElement => (
    <Flex
        direction={['column', 'row', 'row', 'row']}
        justify={['center', 'space-between', 'space-between', 'space-between']}
        align={['flex-start', 'center', 'center', 'center']}
        pr={[0, 10, 10, 10]}
    >
        <DefaultLink href={`/writings/${frontMatter.slug}`}>
            <Text as="h3" fontSize="sm" mb={[2, 0, 0, 0]}>
                {frontMatter.title}
            </Text>
        </DefaultLink>
        <Text fontSize="xs" mb={[2, 0, 0, 0]}>
            {format(parseISO(frontMatter.publishedAt), 'MMMM dd, yyyy')}
        </Text>
    </Flex>
);

const PostsList = ({ posts }: PostsListProps): ReactElement => {
    return (
        <>
            {posts.map((frontMatter) => {
                return <Post key={frontMatter.slug} frontMatter={frontMatter} />;
            })}
        </>
    );
};

export const PostSummaryList = ({ posts }: PostsListProps): ReactElement => {
    return (
        <>
            {posts.map((frontMatter) => {
                return <PostSummary key={frontMatter.slug} frontMatter={frontMatter} />;
            })}
        </>
    );
};

export default PostsList;
