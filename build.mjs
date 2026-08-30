/* Assembles the static pages in the repository root from src/pages + src/partials.
   Run:  node build.mjs
   The generated .html files are committed, so the site needs no build step to deploy. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const P = (...p) => path.join(root, ...p);
const read = (f) => fs.readFileSync(f, 'utf8');

const partials = Object.fromEntries(
  fs.readdirSync(P('src/partials')).map((f) => [path.basename(f, '.html'), read(P('src/partials', f))])
);

const pages = fs.readdirSync(P('src/pages')).filter((f) => f.endsWith('.html'));
let count = 0;

for (const file of pages) {
  const raw = read(P('src/pages', file));
  const meta = {};
  const body = raw.replace(/^<!--meta([\s\S]*?)-->\s*/, (_, block) => {
    block.trim().split('\n').forEach((line) => {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    });
    return '';
  });

  const slug = path.basename(file, '.html');
  const canon = slug === 'index' ? '' : file;

  let head = partials.head
    .replaceAll('{{TITLE}}', meta.title)
    .replaceAll('{{DESC}}', meta.description)
    .replaceAll('{{CANON}}', canon)
    .replaceAll('{{OGIMG}}', meta.image || 'hero-parlor');

  let header = partials.header;
  let nav = meta.nav || slug;
  header = header.replaceAll(`data-nav="${nav}"`, `data-nav="${nav}" aria-current="page"`);

  let footer = partials.footer;
  if (meta.lightbox === 'true') footer = partials.lightbox + '\n\n' + footer;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head.trim().split('\n').map((l) => (l.trim() ? '  ' + l : l)).join('\n')}
${meta.schema ? '  <script type="application/ld+json">' + read(P('src/schema', meta.schema)).trim() + '</script>' : ''}
</head>
<body data-page="${slug}">

${header.trim()}

<main id="main">
${body.trim()}
</main>

${footer.trim()}

</body>
</html>
`;

  fs.writeFileSync(P(file), html);
  count++;
  process.stdout.write(`  built ${file}\n`);
}

console.log(`\n${count} page(s) built.`);
