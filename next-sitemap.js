const domain = process.env.VERCEL_URL || `www.daan.fyi`;
const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;

let policy = {
    userAgent: '*',
};

if (environment !== 'production') {
    policy.disallow = '/';
}

module.exports = {
    siteUrl: `https://${domain}`,
    changefreq: 'monthly',
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [policy],
    },
};
