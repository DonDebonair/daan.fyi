import { Box, Flex, IconButton, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import React, { ReactElement, useState } from 'react';
import CustomLink, { CustomLinkProps } from '@/components/CustomLink';

type MenuItemProps = CustomLinkProps & {
    isLast?: boolean;
};

const MenuItem = ({ isLast, href, children, ...rest }: MenuItemProps) => (
    <CustomLink
        mb={{ base: isLast ? 0 : 8, sm: 0 }}
        mr={{ base: 0, sm: isLast ? 0 : 8 }}
        display="block"
        textDecoration="none"
        _hover={{
            textDecoration: 'none',
        }}
        href={href}
        {...rest}
    >
        {children}
    </CustomLink>
);

const NavBar = (): ReactElement => {
    const [show, setShow] = useState(false);
    const toggleMenu = () => setShow(!show);
    const { colorMode, toggleColorMode } = useColorMode();
    const bg = useColorModeValue('white', 'gray.900');
    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            maxWidth="800px"
            minWidth="356px"
            wrap="wrap"
            w="full"
            mb={8}
            mx="auto"
            px={8}
            py={6}
            position="sticky"
            zIndex={10}
            top={0}
            bg={bg}
            backdropFilter="auto"
            backdropBlur="8px"
            backdropSaturate="180%"
            opacity={0.75}
        >
            <Flex align="center">
                <IconButton
                    aria-label="Toggle dark mode"
                    icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                    onClick={toggleColorMode}
                    backgroundColor="transparent"
                    mx={4}
                />
                <Text m={0} fontSize="xl">
                    Daan Debie
                </Text>
            </Flex>

            <Box display={{ base: 'block', md: 'none' }} onClick={toggleMenu}>
                {show ? <CloseIcon /> : <HamburgerIcon />}
            </Box>
            <Box
                display={{ base: show ? 'block' : 'none', md: 'block' }}
                flexBasis={{ base: '100%', md: 'auto' }}
            >
                <Flex
                    align={['center', 'center', 'center', 'center']}
                    justify={['center', 'space-between', 'flex-end', 'flex-end']}
                    direction={['column', 'row', 'row', 'row']}
                    pt={[4, 4, 0, 0]}
                >
                    <MenuItem href="/">Home</MenuItem>
                    <MenuItem href="/blog">Blog</MenuItem>
                    <MenuItem href="/about">About</MenuItem>
                </Flex>
            </Box>
        </Flex>
    );
};

export default NavBar;
