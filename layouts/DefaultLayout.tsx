import Meta, { MetaProps } from '@/components/Meta';
import React, { ReactElement, ReactNode } from 'react';
import { As, Flex } from '@chakra-ui/react';

type DefaultLayoutProps = MetaProps & {
    children: ReactNode;
    as?: As;
};

const DefaultLayout = ({ children, as, ...meta }: DefaultLayoutProps): ReactElement => {
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
