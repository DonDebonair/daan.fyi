import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { ColorModeScript } from '@chakra-ui/react';

class MyDocument extends Document {
    render(): JSX.Element {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                </Head>
                <body>
                    <ColorModeScript initialColorMode="system" />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
