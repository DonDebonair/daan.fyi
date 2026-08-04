import fs from 'node:fs';

const OLD = '/Users/daan/code/baseline/feeds/feed.json';
const NEW =
    '/private/tmp/claude-501/-Users-daan-code-daan-fyi/8e4f4083-233f-4434-acf5-70a390b32a8b/scratchpad/spike/dist/feeds/feed.json';

const oldItems = JSON.parse(fs.readFileSync(OLD, 'utf8')).items;
const newItems = JSON.parse(fs.readFileSync(NEW, 'utf8')).items;

const textOf = (html) =>
    html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x26;/g, '&')
        .replace(/&#x27;|&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

const tagsOf = (html) => {
    const counts = {};
    for (const m of html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)) {
        counts[m[1].toLowerCase()] = (counts[m[1].toLowerCase()] || 0) + 1;
    }
    return counts;
};

console.log(`baseline items: ${oldItems.length}   spike items: ${newItems.length}\n`);

for (const n of newItems) {
    const slug = n.url.split('/').pop();
    const o = oldItems.find((x) => x.url.endsWith('/' + slug));
    if (!o) {
        console.log(`${slug}: NOT IN BASELINE (spike subset)`);
        continue;
    }
    const ot = textOf(o.content_html);
    const nt = textOf(n.content_html);
    const ow = ot.split(' ').length;
    const nw = nt.split(' ').length;

    console.log(`=== ${slug} ===`);
    console.log(
        `  title match:  ${o.title === n.title ? 'YES' : `NO\n    old: ${o.title}\n    new: ${n.title}`}`
    );
    console.log(`  text words:   baseline ${ow}  spike ${nw}  (delta ${nw - ow})`);

    // Where does the text first diverge?
    if (ot !== nt) {
        let i = 0;
        while (i < ot.length && i < nt.length && ot[i] === nt[i]) i++;
        console.log(`  first text divergence at char ${i} of ${ot.length}:`);
        console.log(`    baseline: ...${JSON.stringify(ot.slice(Math.max(0, i - 40), i + 60))}`);
        console.log(`    spike:    ...${JSON.stringify(nt.slice(Math.max(0, i - 40), i + 60))}`);
    } else {
        console.log('  text: IDENTICAL');
    }

    const ot2 = tagsOf(o.content_html);
    const nt2 = tagsOf(n.content_html);
    const keys = [...new Set([...Object.keys(ot2), ...Object.keys(nt2)])].sort();
    const diffs = keys.filter((k) => (ot2[k] || 0) !== (nt2[k] || 0));
    console.log(`  tag count diffs: ${diffs.length ? '' : 'none'}`);
    for (const k of diffs) console.log(`    <${k}>  baseline ${ot2[k] || 0}  spike ${nt2[k] || 0}`);
    console.log();
}
