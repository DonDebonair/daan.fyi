export const productionHostname = 'daan.fyi';
export const domain = process.env.VERCEL_URL || `www.${productionHostname}`;
export const baseUrl = `https://${domain}`;
export const copyright = `Copyright ${new Date().getFullYear()} - Daan Debie`;
export const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;
