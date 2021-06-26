import Link from 'next/link';
import Head from 'next/head';

const AboutPage = () => (
    <>
        <Head>
            <title>About | Next.js + TypeScript Example</title>
        </Head>
        <h1>About</h1>
        <p>This is the about page</p>
        <p>
            <Link href="/">
                <a>Go home</a>
            </Link>
        </p>
    </>
);

export default AboutPage;
