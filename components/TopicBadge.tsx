import React, { ReactElement } from 'react';
import { Badge } from '@chakra-ui/react';
import { DefaultLink } from '@/components/CustomLink';
import { useColorModeValue } from '@chakra-ui/react';

type TopicBadgeProps = {
    topic: string;
};

const TopicBadge = ({ topic }: TopicBadgeProps): ReactElement => {
    const hoverBg = useColorModeValue('teal.500', 'teal.800');
    const hoverColor = useColorModeValue('whiteAlpha.800', 'teal.200');
    return (
        <DefaultLink href={`/${topic}`}>
            <Badge
                mr={1}
                fontSize="0.6em"
                variant="outline"
                colorScheme="teal"
                _hover={{
                    bg: hoverBg,
                    color: hoverColor,
                    opacity: 0.8,
                }}
            >
                #{topic}
            </Badge>
        </DefaultLink>
    );
};

export default TopicBadge;
