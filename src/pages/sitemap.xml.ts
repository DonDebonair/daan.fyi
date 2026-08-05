import type { APIRoute } from 'astro';
import { baseUrl } from '@/lib/config';

/**
 * The sitemap index, at the URL the site has always served it from.
 *
 * `@astrojs/sitemap` generates the real URL list (`sitemap-0.xml`) but names its index
 * `sitemap-index.xml`, whereas `next-sitemap` named it `sitemap.xml`. Its `filenameBase`
 * option renames *both* files together, so it cannot reproduce the old pair — and
 * `/sitemap.xml` is a live URL that Search Console and robots.txt point at, so letting it
 * 404 is a real regression rather than a cosmetic one.
 *
 * This endpoint re-emits the index at the original URL, byte-for-byte in the shape
 * next-sitemap produced. `sitemap-index.xml` is still emitted by the integration and is
 * left in place: it is unreferenced and harmless, and suppressing it is not configurable.
 */
export const GET: APIRoute = () => {
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>${baseUrl}/sitemap-0.xml</loc></sitemap>
</sitemapindex>
`;
    return new Response(body, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};
