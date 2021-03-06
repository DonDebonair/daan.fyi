'use strict';

const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        quotes: [ERROR, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        'jsx-quotes': [ERROR, 'prefer-double'],
        'react/display-name': [0],
        '@typescript-eslint/ban-ts-comment': [0],
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
