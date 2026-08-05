import type { APIRoute } from 'astro';
import { baseUrl, environment } from '@/lib/config';

/**
 * `next-sitemap` generated this and is gone, so without this endpoint the site would ship
 * with no robots.txt at all.
 *
 * The non-production `Disallow: /` policy is the important part: preview deploys must not
 * be indexed. Ported from `next-sitemap.config.js`, which keyed off
 * `VERCEL_ENV || NODE_ENV`.
 *
 * The layout matches next-sitemap's output so the file diffs cleanly in Phase 8. Note the
 * sitemap points at `/sitemap.xml`, not Astro's `/sitemap-index.xml` — see
 * `sitemap.xml.ts`.
 */
export const GET: APIRoute = () => {
    const disallow = environment !== 'production' ? 'Disallow: /\n' : '';

    const body = `# *
User-agent: *
${disallow}
# Host
Host: ${baseUrl}

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
`;

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
