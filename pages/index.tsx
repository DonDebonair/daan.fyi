import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { GetStaticProps } from 'next';
import { FrontMatter, getAllPostsFrontMatter } from '@/lib/mdx';
import CustomLink from '@/components/CustomLink';
import { format, parseISO } from 'date-fns';

type HomePageProps = {
    lastPosts: Partial<FrontMatter>[];
};

const HomePage = ({ lastPosts }: HomePageProps): ReactNode => (
    <DefaultLayout title="Home | Daan Debie">
        <Heading as="h1" size="2xl">
            Howdy! I‘m Daan.
        </Heading>

        <Text fontSize="lg">
            I‘m a social code grower, firestarter, software smith, music maniac and general nice
            guy. I work as VP of Engineering at{' '}
            <Link href="https://source.ag" isExternal>
                Source.ag
            </Link>{' '}
            where I help accelerate the global transition to sustainable agriculture with A.I.
            powered greenhouses.
        </Text>
        <Text fontSize="lg">
            This is my little oasis from where I shout into the digital desert.
        </Text>

        <Heading as="h2" size="xl">
            Recent posts
        </Heading>
        {lastPosts.map((frontMatter) => {
            return (
                <Flex key={frontMatter.slug} direction="column">
                    <CustomLink href={`/blog/${frontMatter.slug}`}>
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
    const lastPosts = getAllPostsFrontMatter('blog', 3);
    return {
        props: {
            lastPosts,
        },
    };
};

export default HomePage;
