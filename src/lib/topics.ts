import { parseISO } from 'date-fns';
import { getSortedPosts, type Post } from './posts';

/**
 * Topics are derived entirely from `writings` frontmatter — there is no topic registry.
 *
 * Ported from `lib/topics.ts`, minus the stray `console.log(data)` on line 40 and minus
 * `getTopicPreamble`: `content/topics/` has never existed, so that branch has only ever
 * returned null. Phase 6 can reintroduce it the day a preamble is actually written.
 */
export const getAllTopics = async (limit?: number): Promise<Map<string, Post<'writings'>[]>> => {
    const posts = await getSortedPosts('writings');

    const byTopic = posts.reduce((acc, post) => {
        post.data.topics?.forEach((topic) => {
            if (!acc.has(topic)) acc.set(topic, []);
            acc.get(topic)!.push(post);
        });
        return acc;
    }, new Map<string, Post<'writings'>[]>());

    return new Map(
        Array.from(byTopic).map(([topic, topicPosts]) => {
            topicPosts.sort(
                (a, b) =>
                    parseISO(b.data.publishedAt).getTime() - parseISO(a.data.publishedAt).getTime()
            );
            return [topic, limit ? topicPosts.slice(0, limit) : topicPosts];
        })
    );
};
