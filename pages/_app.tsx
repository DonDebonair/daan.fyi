import { ChakraProvider } from '@chakra-ui/react';
import BaseLayout from '../layouts/BaseLayout';
import theme from '../styles/theme';
import '@fontsource/merriweather/400.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/400-italic.css';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/700-italic.css';
import React, { ReactNode } from 'react';
import { AppProps } from 'next/app';

const MyApp = ({ Component, pageProps }: AppProps): ReactNode => {
    return (
        <ChakraProvider resetCSS theme={theme}>
            <BaseLayout>
                <Component {...pageProps} />
            </BaseLayout>
        </ChakraProvider>
    );
};

export default MyApp;
