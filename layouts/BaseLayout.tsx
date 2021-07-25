import React, { ReactElement, ReactNode } from 'react';
import { Flex, Spacer } from '@chakra-ui/react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

type LayoutProps = {
    children: ReactNode;
};

const BaseLayout = ({ children }: LayoutProps): ReactElement => (
    <Flex direction="column" minH="100vh">
        <NavBar />
        <Flex as="main" justify="center" direction="column">
            {children}
        </Flex>
        <Spacer />
        <Footer />
    </Flex>
);

export default BaseLayout;
