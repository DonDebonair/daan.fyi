import { serialize } from 'next-mdx-remote/serialize';
import mdxPrism from 'mdx-prism';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import remarkCapitalize from 'remark-capitalize';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { TITLE_OPTIONS } from '@/lib/titleCase';
import remarkTextr from 'remark-textr';
import apostrophes from 'typographic-apostrophes';
import quotes from 'typographic-quotes';
import apostrophesForPlurals from 'typographic-apostrophes-for-possessive-plurals';
import arrows from 'typographic-arrows';
import copyright from 'typographic-copyright';
import ellipses from 'typographic-ellipses';
import emDashes from 'typographic-em-dashes';
import enDashes from 'typographic-en-dashes';
import mathSymbols from 'typographic-math-symbols';
import registeredTrademark from 'typographic-registered-trademark';
import singleSpaces from 'typographic-single-spaces';
import trademark from 'typographic-trademark';
import imageSize from 'rehype-img-size';
import remarkUnwrapImages from 'remark-unwrap-images';

const serializePost = async (content: string): Promise<MDXRemoteSerializeResult> => {
    return await serialize(content, {
        mdxOptions: {
            remarkPlugins: [
                // @ts-ignore
                remarkUnwrapImages,
                [remarkCapitalize, TITLE_OPTIONS],
                [
                    // @ts-ignore
                    remarkTextr,
                    {
                        plugins: [
                            apostrophes,
                            quotes,
                            apostrophesForPlurals,
                            arrows,
                            copyright,
                            ellipses,
                            emDashes,
                            enDashes,
                            mathSymbols,
                            registeredTrademark,
                            singleSpaces,
                            trademark,
                        ],
                    },
                ],
            ],
            rehypePlugins: [
                rehypeCodeTitles,
                mdxPrism,
                rehypeSlug,
                rehypeAutolinkHeadings,
                [imageSize, { dir: 'public' }],
            ],
        },
    });
};

export default serializePost;
