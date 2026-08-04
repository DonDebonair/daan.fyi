import SideNote from './SideNote.astro';
import Small from './Small.astro';
import Asterisk from './Asterisk.astro';

/**
 * The three components MDX sources use without importing them. Passed to every
 * <Content components={mdxComponents} /> and to the Container API in the feed endpoints.
 *
 * This is all that survives of `components/MDXComponents.tsx` (123 lines): every plain
 * HTML element it remapped to a Chakra component is handled by plain CSS in Phase 5.
 */
export const mdxComponents = { SideNote, Small, Asterisk };
