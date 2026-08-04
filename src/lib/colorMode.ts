/**
 * Storage key for the visitor's explicit colour-mode choice.
 *
 * Anything that *writes* the mode must use this. The blocking script in
 * ColorModeScript.astro is `is:inline` and therefore cannot import — it repeats the
 * literal, with a comment pointing here.
 */
export const COLOR_MODE_KEY = 'color-mode';

/** Chakra's old key, read once as a fallback so existing visitors keep their choice. */
export const LEGACY_COLOR_MODE_KEY = 'chakra-ui-color-mode';
