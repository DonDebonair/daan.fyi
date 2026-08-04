import makeTitle from 'title';

/**
 * Acronyms the `title` package would otherwise flatten. Ported unchanged — these are
 * verified in Phase 8 against the baseline.
 */
export const TITLE_OPTIONS = {
    special: ['PS', 'OCJP', 'VPS', 'VirtPHP', 'NextJS', 'AWS', 'RSS', 'TypeVar', 'SSO', 'IAM'],
};

const titleCase = (title: string): string => makeTitle(title, TITLE_OPTIONS);

export default titleCase;
