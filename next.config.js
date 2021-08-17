/* eslint-disable @typescript-eslint/no-var-requires */
const { withPlausibleProxy } = require('next-plausible');

module.exports = withPlausibleProxy()({
    experimental: { esmExternals: true },
});
