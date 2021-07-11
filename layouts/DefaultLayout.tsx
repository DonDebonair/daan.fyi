import Meta, { MetaProps } from '@/components/Meta';
import React, { ElementType, ReactNode } from 'react';
import { As, Flex } from '@chakra-ui/react';

type DefaultLayoutProps = MetaProps & {
    children: ReactNode;
    as?: As;
};

const DefaultLayout: ElementType = ({ children, as, ...meta }: DefaultLayoutProps) => {
    return (
        <>
            <Meta {...meta} />
            <Flex
                as={as ?? 'div'}
                direction="column"
                justify="center"
                align="flex-start"
                m="0 auto 4rem auto"
                maxWidth="800px"
                w="100%"
                px={2}
            >
                {children}
            </Flex>
        </>
    );
};

export default DefaultLayout;
