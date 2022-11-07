/* eslint-disable @typescript-eslint/no-var-requires */
const { withPlausibleProxy } = require('next-plausible');

module.exports = withPlausibleProxy()({
    async redirects() {
        return [
            {
                source: '/blog/:slug',
                destination: '/writings/:slug',
                permanent: true,
            },
        ];
    },
});
