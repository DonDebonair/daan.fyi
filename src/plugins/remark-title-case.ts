import { visit } from 'unist-util-visit';
import makeTitle from 'title';
import type { Root, Text } from 'mdast';
import { TITLE_OPTIONS } from '../lib/titleCase';

/**
 * Title-cases every heading. Replaces `remark-capitalize`, which had to be patched via
 * patch-package purely to accept an options argument — that patch, patch-package and the
 * postinstall hook are all gone now.
 *
 * ⚠️ **One deliberate behavioural change from the original.** `remark-capitalize` called
 * `.trim()` on each text node before title-casing it. `visit` reaches every text node
 * inside a heading, including those nested in links and emphasis, so trimming deleted the
 * spaces separating them:
 *
 *     ## Help! [My girlfriend](…) can't choose between twitter and the television!
 *     → Help!My GirlfriendCan't Choose between Twitter and the Television!
 *
 * The trim compensated for nothing — `title()` preserves leading and trailing whitespace,
 * so dropping it yields exactly what title-casing the heading as a whole would produce.
 * One heading in the corpus is affected, and its anchor id changes from
 * `helpmy-girlfriendcant-choose-…` to `help-my-girlfriend-cant-choose-…`. Nothing links
 * to the old id. See MIGRATION.md Phase 4, finding 2.
 *
 * Residual quirk, not worth fixing: each text node is still title-cased independently, so
 * a node beginning with a small word would be capitalised as a sentence start where
 * whole-heading casing would leave it lowercase (`…and [the] rest` → `The`). That needs
 * inline markup mid-heading *and* a leading small word to trigger; no heading does.
 */
export function remarkTitleCase() {
    return (tree: Root): void => {
        visit(tree, 'heading', (heading) => {
            visit(heading, 'text', (textNode: Text) => {
                textNode.value = makeTitle(textNode.value ?? '', TITLE_OPTIONS);
            });
        });
    };
}

export default remarkTitleCase;
