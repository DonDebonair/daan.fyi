import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/layout';
import Link, { LinkProps } from 'next/link';
import React, { ReactElement } from 'react';
import { useColorModeValue } from '@chakra-ui/react';

export type CustomLinkProps = LinkProps & ChakraLinkProps;

const CustomLink = ({ href, children, ...rest }: CustomLinkProps): ReactElement => {
    const hrefInternal = href.startsWith('/') || href.startsWith('#');
    if (hrefInternal) {
        return (
            <Link href={href} passHref>
                <ChakraLink {...rest}>{children}</ChakraLink>
            </Link>
        );
    }
    return (
        <ChakraLink isExternal href={href} {...rest}>
            {children}
        </ChakraLink>
    );
};

export const StylishLink = (props: CustomLinkProps) => {
    const color = useColorModeValue('orange.400', 'orange.500');
    return (
        <CustomLink
            bgGradient={`linear(to-b, ${color} 0%, ${color} 100%)`}
            backgroundPosition="0 100%"
            textDecoration="none"
            backgroundRepeat="repeat-x"
            backgroundSize="2px 2px"
            transition="background-size .2s"
            _hover={{
                textDecoration: 'none',
                backgroundSize: '4px 50px',
            }}
            {...props}
        />
    );
};

export const DefaultLink = (props: CustomLinkProps) => (
    <CustomLink textDecoration="none" _hover={{ textDecoration: 'none' }} {...props} />
);

export default CustomLink;
