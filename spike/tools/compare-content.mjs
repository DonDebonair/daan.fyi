/**
 * Batch-compare the Astro build against the Next baseline for every content file.
 *
 * Heading ids are the strongest single signal: they encode title-casing, the acronym
 * exceptions, the remark-capitalize trim quirk and the slugger, all at once.
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = '/Users/daan/code/baseline/html';
// Phase 6 deleted the temporary `check/` route, so this now points at the real pages.
// Heading ids still compare cleanly because ids come only from Markdown headings — page
// chrome (the title, the series box, SideNote headings) carries none.
const CAND = '/Users/daan/code/daan.fyi/dist';

const clean = (h) =>
    h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '');

const headingIds = (h) => [...clean(h).matchAll(/<h[1-6][^>]*\sid="([^"]+)"/g)].map((m) => m[1]);

const TYPO = ['“', '”', '‘', '’', '—', '–', '…', '→', '←', '×', '±', '©', '®', '™'];
const typo = (h) => {
    const text = clean(h).replace(/<[^>]+>/g, ' ');
    return Object.fromEntries(TYPO.map((c) => [c, text.split(c).length - 1]));
};

const cases = [];
for (const [coll, baseDir] of [
    ['writings', 'writings'],
    ['archive', 'archive'],
]) {
    for (const f of fs.readdirSync(path.join(CAND, coll))) {
        const slug = f.replace('.html', '');
        cases.push({
            name: `${coll}/${slug}`,
            base: path.join(BASE, baseDir, `${slug}.html`),
            cand: path.join(CAND, coll, f),
        });
    }
}
cases.push({
    name: '_kitchensink',
    base: path.join(BASE, '_kitchensink.html'),
    cand: path.join(CAND, '_kitchensink.html'),
});

let idFails = 0,
    typoFails = 0,
    missing = 0;
const detail = [];

for (const c of cases) {
    if (!fs.existsSync(c.base)) {
        console.log(`?? no baseline for ${c.name}`);
        missing++;
        continue;
    }
    const b = fs.readFileSync(c.base, 'utf8'),
        n = fs.readFileSync(c.cand, 'utf8');

    const ib = headingIds(b),
        ic = headingIds(n);
    const onlyBase = ib.filter((x) => !ic.includes(x));
    const onlyCand = ic.filter((x) => !ib.includes(x));
    if (onlyBase.length || onlyCand.length) {
        idFails++;
        detail.push(
            `  ${c.name}\n      only in baseline:  ${onlyBase.join(', ') || '-'}\n      only in candidate: ${onlyCand.join(', ') || '-'}`
        );
    }

    const tb = typo(b),
        tn = typo(n);
    const bad = TYPO.filter((ch) => tb[ch] !== tn[ch]);
    if (bad.length) {
        typoFails++;
        detail.push(
            `  ${c.name} TYPO\n      ${bad.map((ch) => `${ch} base=${tb[ch]} cand=${tn[ch]}`).join('  ')}`
        );
    }
}

console.log(`\n${cases.length} documents compared (${missing} without a baseline)`);
console.log(`heading-id mismatches: ${idFails}`);
console.log(`typography mismatches: ${typoFails}`);
if (detail.length) {
    console.log('\n--- detail ---');
    console.log(detail.join('\n'));
}
