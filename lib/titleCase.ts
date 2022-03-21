import makeTitle from 'title';

export const TITLE_OPTIONS = {
    special: ['PS', 'OCJP', 'VPS', 'VirtPHP', 'NextJS', 'AWS', 'RSS', 'TypeVar', 'SSO', 'IAM'],
};

const titleCase = (title: string): string => makeTitle(title, TITLE_OPTIONS);

export default titleCase;
