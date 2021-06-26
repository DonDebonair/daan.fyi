import Link from 'next/link';
import { Heading } from '@chakra-ui/react';
import Head from 'next/head';

const IndexPage = () => (
    <>
        <Head>
            <title>Home | Next.js + TypeScript Example</title>
        </Head>
        <Heading
            as="h1"
            size="xl"
            fontWeight="bold"
            color="primary.200"
            textAlign={['center', 'center', 'left', 'left']}
        >
            Hello Next.js 👋
        </Heading>
        <p>
            <Link href="/about">
                <a>About</a>
            </Link>
        </p>
    </>
);
export default IndexPage;
