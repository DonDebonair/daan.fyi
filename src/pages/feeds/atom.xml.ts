import type { APIRoute } from 'astro';
import { getFeed } from '@/lib/feeds';

export const GET: APIRoute = async () => {
    const feed = await getFeed();
    return new Response(feed.atom1(), {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
    });
};
