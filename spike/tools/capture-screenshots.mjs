import { chromium } from 'playwright';
import fs from 'fs';

const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';
const OUT = process.env.OUT || '/Users/daan/code/baseline/screenshots';

// Pages chosen to exercise every distinct rendering feature (see MIGRATION.md coverage map)
const PAGES = [
    ['home', '/'],
    ['writings-index', '/writings'],
    ['topics-index', '/topics'],
    ['archive-index', '/archive'],
    ['about', '/about'],
    ['kitchensink', '/_kitchensink'],
    ['post-sidenote', '/writings/mental-health'],
    ['post-sidenote-series', '/writings/iam'],
    ['post-line-highlight', '/writings/python-protocols'],
    ['post-code-titles', '/writings/rss'],
    ['post-images', '/writings/aws-multi-account'],
    ['archive-post', '/archive/there-is-no-big-data'],
    ['topic-page', '/python'],
];

const MODES = ['light', 'dark'];

const browser = await chromium.launch();
let n = 0;
const manifest = [];

for (const mode of MODES) {
    const ctx = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: mode,
    });
    // Chakra reads this key on boot via ColorModeScript
    await ctx.addInitScript(`try { localStorage.setItem('chakra-ui-color-mode', '${mode}'); } catch (e) {}`);

    for (const [name, path] of PAGES) {
        const page = await ctx.newPage();
        await page.goto(ORIGIN + path, { waitUntil: 'networkidle' });

        // next/image lazy-loads below the fold and a fullPage screenshot does NOT
        // trigger it. Scrolling alone is not enough either: at 60fps the
        // IntersectionObserver never fires for intermediate positions. Force every
        // image eager, then scroll with real delays as a belt-and-braces measure.
        await page.evaluate(() => {
            for (const img of document.images) {
                img.loading = 'eager';
                if (!img.complete) img.src = img.src; // re-kick the fetch
            }
        });
        for (let y = 0; y < 40; y++) {
            const done = await page.evaluate((i) => {
                window.scrollTo(0, i * window.innerHeight);
                return i * window.innerHeight > document.body.scrollHeight;
            }, y);
            await page.waitForTimeout(120);
            if (done) break;
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(
            () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
            null,
            { timeout: 60000 }
        );
        // fonts settle before capture, otherwise metrics shift between runs
        await page.evaluate(() => document.fonts.ready);

        const applied = await page.evaluate(() => ({
            bodyClass: document.body.className,
            dataTheme: document.body.dataset.theme || document.documentElement.dataset.theme || null,
            bg: getComputedStyle(document.body).backgroundColor,
            images: document.images.length,
            imagesLoaded: Array.from(document.images).filter((i) => i.naturalWidth > 0).length,
        }));

        const file = `${OUT}/${mode}/${name}.png`;
        fs.mkdirSync(`${OUT}/${mode}`, { recursive: true });
        await page.screenshot({ path: file, fullPage: true });
        manifest.push({ mode, name, path, ...applied });
        await page.close();
        n++;
    }
    await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`captured ${n} screenshots`);

// sanity: light and dark must actually differ
for (const [name] of PAGES) {
    const l = manifest.find((m) => m.mode === 'light' && m.name === name);
    const d = manifest.find((m) => m.mode === 'dark' && m.name === name);
    if (l.bg === d.bg) console.log(`WARNING: ${name} identical bg in both modes (${l.bg})`);
}
console.log('light bg:', manifest.find((m) => m.mode === 'light').bg);
console.log('dark  bg:', manifest.find((m) => m.mode === 'dark').bg);
