import React, { ReactElement } from 'react';
import { Box, Circle, Heading, HStack, Stack, useColorModeValue } from '@chakra-ui/react';
import CustomLink from '@/components/CustomLink';
import { SimplePost } from '@/lib/posts';

type SeriesOverviewProps = {
    title: string;
    posts: SimplePost[];
    currentSlug: string;
};

const SeriesOverview = ({ title, posts, currentSlug }: SeriesOverviewProps): ReactElement => {
    const borderColor = useColorModeValue('teal.500', 'teal.800');
    const separatorColor = useColorModeValue('teal.400', 'teal.900');
    const circleBg = useColorModeValue('teal.400', 'teal.500');
    const currentCircleBg = useColorModeValue('teal.200', 'teal.200');
    const circleTextColor = useColorModeValue('gray.800', 'whiteAlpha.900');
    const currentCircleTextColor = useColorModeValue('gray.800', 'gray.800');
    return (
        <Box w="80%" mx="auto" my={4} borderRadius="md" borderColor={borderColor} borderWidth={1}>
            <Box w="100%" p={4} borderBottomColor={separatorColor} borderBottomWidth={1}>
                <Heading as="h1" my={0} size="md">
                    {title}
                </Heading>
            </Box>
            <Stack px={4} py={2} spacing={2}>
                {posts.map((p, i) => {
                    const bgColor = p.slug == currentSlug ? currentCircleBg : circleBg;
                    const textColor =
                        p.slug == currentSlug ? currentCircleTextColor : circleTextColor;
                    return (
                        <HStack key={p.slug}>
                            <Circle size="40px" bg={bgColor} color={textColor}>
                                {i + 1}
                            </Circle>
                            <CustomLink href={`/writings/${p.slug}`}>{p.title}</CustomLink>
                        </HStack>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default SeriesOverview;
