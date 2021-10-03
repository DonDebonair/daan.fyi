import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import { ColorModeScript } from '@chakra-ui/react';

class MyDocument extends Document {
    render(): JSX.Element {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                    <link href="/favicons/favicon.ico" rel="shortcut icon" />
                    <link
                        href="/favicons/apple-touch-icon.png"
                        rel="apple-touch-icon"
                        sizes="180x180"
                    />
                    <link
                        href="/favicons/favicon-32x32.png"
                        rel="icon"
                        sizes="32x32"
                        type="image/png"
                    />
                    <link
                        href="/favicons/favicon-16x16.png"
                        rel="icon"
                        sizes="16x16"
                        type="image/png"
                    />
                    <link
                        rel="alternate"
                        type="application/rss+xml"
                        title="Daan Debie RSS feed"
                        href="/feeds/feed.xml"
                    />
                    <link
                        rel="alternate"
                        type="application/atom+xml"
                        title="Daan Debie Atom feed"
                        href="/feeds/atom.xml"
                    />
                    <link
                        rel="alternate"
                        type="application/feed+json"
                        title="Daan Debie JSON feed"
                        href="/feeds/feed.json"
                    />
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
