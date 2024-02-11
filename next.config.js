/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    async redirects() {
        return [
            {
                source: '/blog/:slug',
                destination: '/writings/:slug',
                permanent: true,
            },
        ];
    },
};
