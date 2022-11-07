import { Divider, Flex, Text, HStack, IconButton, Link } from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import { GrTwitter, GrGithub, GrLinkedin } from 'react-icons/gr';
import { BsMastodon } from 'react-icons/bs';
import { DefaultLink } from '@/components/CustomLink';
import { copyright } from '@/lib/config';

const Footer = (): ReactElement => (
    <Flex direction="column" maxW="800px" w="100%" m="0 auto">
        <Divider mb={4} />
        <HStack justify="center">
            <Link
                href="https://fosstodon.org/@daan"
                title="Mastodon"
                rel="me noopener noreferrer"
                isExternal
            >
                <IconButton aria-label="Mastodon" icon={<BsMastodon />} variant="ghost" />
            </Link>
            <Link
                href="https://twitter.com/DaanDebie"
                title="Twitter"
                rel="me noopener noreferrer"
                isExternal
            >
                <IconButton aria-label="Twitter" icon={<GrTwitter />} variant="ghost" />
            </Link>
            <Link
                href="https://github.com/DonDebonair"
                title="GitHub"
                rel="me noopener noreferrer"
                isExternal
            >
                <IconButton aria-label="GitHub" icon={<GrGithub />} variant="ghost" />
            </Link>
            <Link
                href="https://www.linkedin.com/in/danieldebie"
                title="LinkedIn"
                rel="me noopener noreferrer"
                isExternal
            >
                <IconButton aria-label="LinkedIn" icon={<GrLinkedin />} variant="ghost" />
            </Link>
        </HStack>
        <Flex direction="column" align="center">
            <DefaultLink pb={2} fontSize="sm" href="/topics">
                All posts by topic
            </DefaultLink>
            <DefaultLink fontSize="sm" href="/archive">
                Archive
            </DefaultLink>
        </Flex>
        <Flex p={8} justify="center">
            <Text fontSize="sm">{copyright}</Text>
        </Flex>
    </Flex>
);

export default Footer;
