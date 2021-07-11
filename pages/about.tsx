import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';

const AboutPage = (): ReactNode => (
    <DefaultLayout title="About | Daan Debie">
        <h1>About</h1>
        <p>This is the about page</p>
        <p>
            <Link href="/">
                <a>Go home</a>
            </Link>
        </p>
    </DefaultLayout>
);

export default AboutPage;
