/**
 * Pixel-diff the candidate screenshots against the Phase 0 baseline.
 *
 * Uses the Chromium that Playwright already provides rather than adding an image
 * library: both PNGs are drawn to canvases and compared in-page.
 *
 * Pages have different heights once content shifts, so each pair is compared over the
 * overlapping region and the height delta is reported separately — a large height delta
 * with a small pixel delta usually means "something above shifted everything down",
 * which is a different problem from "these pixels are the wrong colour".
 *
 *   BASE=/Users/daan/code/baseline/screenshots \
 *   CAND=/Users/daan/code/candidate/screenshots \
 *   node compare-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || '/Users/daan/code/baseline/screenshots';
const CAND = process.env.CAND || '/Users/daan/code/candidate/screenshots';
const THRESHOLD = Number(process.env.THRESHOLD || 8); // per-channel tolerance

const browser = await chromium.launch();
const page = await browser.newPage();

const compare = async (a, b) => {
    const toUrl = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
    return page.evaluate(
        async ([srcA, srcB, threshold]) => {
            const load = (src) =>
                new Promise((res, rej) => {
                    const i = new Image();
                    i.onload = () => res(i);
                    i.onerror = rej;
                    i.src = src;
                });
            const [ia, ib] = await Promise.all([load(srcA), load(srcB)]);
            const w = Math.min(ia.width, ib.width);
            const h = Math.min(ia.height, ib.height);
            const draw = (img) => {
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0);
                return c.getContext('2d').getImageData(0, 0, w, h).data;
            };
            const da = draw(ia);
            const db = draw(ib);
            let diff = 0;
            let firstY = -1;
            for (let p = 0; p < da.length; p += 4) {
                if (
                    Math.abs(da[p] - db[p]) > threshold ||
                    Math.abs(da[p + 1] - db[p + 1]) > threshold ||
                    Math.abs(da[p + 2] - db[p + 2]) > threshold
                ) {
                    diff++;
                    if (firstY < 0) firstY = Math.floor(p / 4 / w);
                }
            }
            return {
                pct: (diff / (w * h)) * 100,
                firstDiffY: firstY,
                heightA: ia.height,
                heightB: ib.height,
            };
        },
        [toUrl(a), toUrl(b), THRESHOLD]
    );
};

const rows = [];
for (const mode of ['light', 'dark']) {
    const dir = path.join(BASE, mode);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs
        .readdirSync(dir)
        .filter((x) => x.endsWith('.png'))
        .sort()) {
        const a = path.join(dir, f);
        const b = path.join(CAND, mode, f);
        if (!fs.existsSync(b)) {
            rows.push({ page: f.replace('.png', ''), mode, missing: true });
            continue;
        }
        const r = await compare(a, b);
        rows.push({ page: f.replace('.png', ''), mode, ...r });
    }
}
await browser.close();

rows.sort((x, y) => (y.pct ?? 0) - (x.pct ?? 0));
console.log('page                     mode   diff%   firstDiffY   height base→cand');
console.log('─'.repeat(74));
for (const r of rows) {
    if (r.missing) {
        console.log(`${r.page.padEnd(24)} ${r.mode.padEnd(6)} MISSING`);
        continue;
    }
    const dh = r.heightB - r.heightA;
    console.log(
        `${r.page.padEnd(24)} ${r.mode.padEnd(6)} ${r.pct.toFixed(2).padStart(6)}  ` +
            `${String(r.firstDiffY).padStart(10)}   ${r.heightA} → ${r.heightB}` +
            `${dh ? ` (${dh > 0 ? '+' : ''}${dh})` : ''}`
    );
}
