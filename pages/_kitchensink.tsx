import { GetStaticProps } from 'next';
import { getAndSerializePost } from '@/lib/posts';
import ArticlePage from './archive/[slug]';

export const getStaticProps: GetStaticProps = async () => {
    const { mdxSource, frontMatter } = await getAndSerializePost('special', '_kitchensink');
    return {
        props: {
            mdxSource,
            frontMatter,
        },
    };
};

export default ArticlePage;
