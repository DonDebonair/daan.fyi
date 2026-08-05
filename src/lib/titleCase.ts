import makeTitle from 'title';

/**
 * Words the `title` package would otherwise flatten.
 *
 * The first ten are the original list. The last two were added in Phase 7 to recover
 * casing that regressed when heading title-casing moved to `title@3.5.3`:
 *
 * The Chakra build ran **two different versions of `title` in one build** —
 * `remark-capitalize` bundled its own `title@3.3.1` for headings, while frontmatter
 * titles used the root `title@3.5.3`. The port uses 3.5.3 for both. 3.5.3 knows more
 * brand names (TypeScript, GitHub, PHP all improved) but stopped capitalising after a
 * `/` and after a curly quote, which these two entries restore.
 *
 * `special` forces exact casing, so non-acronyms are a legitimate use of it.
 */
export const TITLE_OPTIONS = {
    special: [
        'PS',
        'OCJP',
        'VPS',
        'VirtPHP',
        'NextJS',
        'AWS',
        'RSS',
        'TypeVar',
        'SSO',
        'IAM',
        'Usage', // "Installation/usage" → "Installation/Usage"
        'Internettax', // "“internettax”" → "“Internettax”"
    ],
};

const titleCase = (title: string): string => makeTitle(title, TITLE_OPTIONS);

export default titleCase;
