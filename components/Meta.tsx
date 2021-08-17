import Head from 'next/head';
import { useRouter } from 'next/router';
import { baseUrl } from '@/lib/config';
import React, { ReactElement } from 'react';

export type MetaProps = {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    date?: string;
};

const defaultMeta: MetaProps = {
    title: 'Daan Debie - Nice person',
    description: 'Social Code Grower, Firestarter, Music Maniac & General Nice Guy',
    image: `${baseUrl}/images/banner.png`,
    type: 'website',
};

const Meta = (metaProps: MetaProps): ReactElement => {
    const router = useRouter();
    const meta = {
        ...defaultMeta,
        ...metaProps,
    };
    return (
        <Head>
            <title>{meta.title}</title>
            <meta name="robots" content="follow, index" />
            <meta name="author" content="Daan Debie" />
            <meta name="description" content={meta.description} />
            <meta property="og:url" content={`www.${baseUrl}${router.asPath}`} />
            <link rel="canonical" href={`www.${baseUrl}${router.asPath}`} />
            <meta property="og:type" content={meta.type} />
            <meta property="og:site_name" content="Daan Debie" />
            <meta property="og:description" content={meta.description} />
            <meta property="og:title" content={meta.title} />
            <meta property="og:image" content={meta.image} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@DaanDebie" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={meta.image} />
            {meta.date && <meta property="article:published_time" content={meta.date} />}
        </Head>
    );
};

export default Meta;
