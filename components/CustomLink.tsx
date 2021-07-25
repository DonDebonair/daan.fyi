import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/layout';
import Link, { LinkProps } from 'next/link';
import React, { ReactElement } from 'react';

export type AccessibleLinkProps = LinkProps & ChakraLinkProps;

const CustomLink = ({ href, children, ...rest }: AccessibleLinkProps): ReactElement => {
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

export default CustomLink;
