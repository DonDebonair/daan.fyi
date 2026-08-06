import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/daan/code/daan.fyi/content';
const files = [];
for (const dir of ['writings', 'archive', 'special']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
        if (f.endsWith('.mdx')) files.push(path.join(ROOT, dir, f));
    }
}

const strip = (src) =>
    src
        .replace(/^---[\s\S]*?^---/m, '') // frontmatter
        .replace(/```[\s\S]*?```/g, '') // fenced code
        .replace(/`[^`\n]*`/g, '') // inline code
        .replace(/\[[^\]]*\]\([^)]*\)/g, '') // markdown links
        .replace(/<[^>]+>/g, '') // raw HTML / JSX tags
        .replace(/^\s{4,}\S.*$/gm, ''); // indented code

const checks = {
    'bare URL (autolink)': /(?:^|\s)(https?:\/\/|www\.)[^\s)]+/g,
    'bare email (autolink)': /(?:^|\s)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    table: /^\s*\|.*\|\s*$/gm,
    strikethrough: /~~[^~]+~~/g,
    footnote: /\[\^[^\]]+\]/g,
    'task list': /^\s*[-*] \[[ xX]\]/gm,
};

const findings = {};
for (const file of files) {
    const clean = strip(fs.readFileSync(file, 'utf8'));
    for (const [name, re] of Object.entries(checks)) {
        const hits = [...clean.matchAll(re)].map((m) => m[0].trim());
        if (hits.length) {
            findings[name] ??= [];
            findings[name].push({ file: file.replace(ROOT + '/', ''), hits });
        }
    }
}

if (!Object.keys(findings).length) {
    console.log('No GFM-sensitive syntax in any content file.');
} else {
    for (const [name, entries] of Object.entries(findings)) {
        const total = entries.reduce((a, e) => a + e.hits.length, 0);
        console.log(`\n=== ${name} — ${total} occurrence(s) in ${entries.length} file(s) ===`);
        for (const e of entries) {
            console.log(`  ${e.file}`);
            for (const h of e.hits.slice(0, 4)) console.log(`      ${h.slice(0, 110)}`);
            if (e.hits.length > 4) console.log(`      … +${e.hits.length - 4} more`);
        }
    }
}
