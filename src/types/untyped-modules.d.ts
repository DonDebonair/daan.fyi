/**
 * Ambient declarations for dependencies that ship no types.
 *
 * These are the packages the Chakra build silenced with `@ts-ignore` in `lib/mdx.ts`.
 * Declaring them here is narrower than that: only the module shape is asserted, and the
 * rest of the pipeline still type-checks.
 */

declare module 'title' {
    /** Title-cases a string. `special` lists acronyms to preserve verbatim. */
    export default function title(
        value: string,
        options?: { special?: string[]; [key: string]: unknown }
    ): string;
}

/**
 * The twelve `typographic-*` plugins all export the same shape: a string transform used
 * as a `remark-textr` plugin.
 */
declare module 'typographic-apostrophes' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-apostrophes-for-possessive-plurals' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-arrows' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-copyright' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-ellipses' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-em-dashes' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-en-dashes' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-math-symbols' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-quotes' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-registered-trademark' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-single-spaces' {
    const plugin: (input: string) => string;
    export default plugin;
}
declare module 'typographic-trademark' {
    const plugin: (input: string) => string;
    export default plugin;
}
