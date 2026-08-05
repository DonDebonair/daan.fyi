import type { APIRoute } from 'astro';
import { getFeed } from '@/lib/feeds';

export const GET: APIRoute = async () => {
    const feed = await getFeed();
    return new Response(feed.rss2(), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
};
