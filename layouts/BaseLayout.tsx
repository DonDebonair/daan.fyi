import React, { ReactNode } from 'react';
import { Flex, Spacer } from '@chakra-ui/react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

type LayoutProps = {
    children: ReactNode;
};

const BaseLayout = ({ children }: LayoutProps): ReactNode => (
    <Flex direction="column" minH="100vh">
        <NavBar />
        <Flex as="main" justifyContent="center" flexDirection="column">
            {children}
        </Flex>
        <Spacer />
        <Footer />
    </Flex>
);

export default BaseLayout;
