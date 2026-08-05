import type { APIRoute } from 'astro';
import { getFeed } from '@/lib/feeds';

export const GET: APIRoute = async () => {
    const feed = await getFeed();
    return new Response(feed.json1(), {
        headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
    });
};
