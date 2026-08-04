/**
 * Replaces rehype-code-titles. Reads `title="..."` out of the fence meta and emits the
 * same `.rehype-code-title` div the current site styles, immediately before the <pre>.
 */
/** @returns {import('@shikijs/types').ShikiTransformer} */
export function transformerCodeTitle() {
    return {
        name: 'code-title',
        pre(node) {
            const meta = this.options.meta?.__raw ?? '';
            const match = /title="([^"]+)"/.exec(meta);
            if (!match) return;

            // Wrap so the title and the pre stay adjacent siblings, matching the
            // `.rehype-code-title + pre` selector in the current stylesheet.
            return {
                type: 'element',
                tagName: 'div',
                properties: { class: 'code-title-wrapper' },
                children: [
                    {
                        type: 'element',
                        tagName: 'div',
                        properties: { class: 'rehype-code-title' },
                        children: [{ type: 'text', value: match[1] }],
                    },
                    node,
                ],
            };
        },
    };
}
