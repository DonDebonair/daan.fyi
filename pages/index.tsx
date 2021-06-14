import Link from 'next/link';
import Layout from '../components/Layout';
import { Heading } from '@chakra-ui/react';

const IndexPage = () => (
    <Layout title="Home | Next.js + TypeScript Example">
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
    </Layout>
);

export default IndexPage;
