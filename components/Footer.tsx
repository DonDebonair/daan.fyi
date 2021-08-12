import { Divider, Flex, Text, HStack, IconButton, Link } from '@chakra-ui/react';
import React, { ReactElement } from 'react';
import { GrTwitter, GrGithub, GrLinkedin } from 'react-icons/gr';
import { DefaultLink } from '@/components/CustomLink';

const Footer = (): ReactElement => (
    <Flex direction="column" maxW="800px" w="100%" m="0 auto">
        <Divider mb={4} />
        <HStack justify="center">
            <Link href="https://twitter.com/DaanDebie" title="Twitter" isExternal>
                <IconButton aria-label="Twitter" icon={<GrTwitter />} size="lg" variant="ghost" />
            </Link>
            <Link href="https://github.com/DandyDev" title="GitHub" isExternal>
                <IconButton aria-label="GitHub" icon={<GrGithub />} size="lg" variant="ghost" />
            </Link>
            <Link href="https://www.linkedin.com/in/danieldebie" title="LinkedIn" isExternal>
                <IconButton aria-label="LinkedIn" icon={<GrLinkedin />} size="lg" variant="ghost" />
            </Link>
        </HStack>
        <Flex justify="center">
            <DefaultLink href="/archive">Archive</DefaultLink>
        </Flex>
        <Flex p={8} justify="center">
            <Text>Copyright 2021 - Daan Debie</Text>
        </Flex>
    </Flex>
);

export default Footer;
