import path from 'path';

export const CONTENT_DIR = 'content';
export const root = process.cwd();
export type ContentType = 'writings' | 'archive' | 'topics';

export const contentPath = (...pathElements: string[]): string => {
    return path.join(root, CONTENT_DIR, ...pathElements);
};
