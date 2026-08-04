'use strict';

const ERROR = 2;

module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'next', 'prettier'],
    parser: '@typescript-eslint/parser',
    rules: {
        quotes: [ERROR, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        'jsx-quotes': [ERROR, 'prefer-double'],
        'react/display-name': [0],
        '@typescript-eslint/ban-ts-comment': [0],
    },
};
