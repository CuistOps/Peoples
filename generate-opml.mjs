#!/usr/bin/env node
// Génère un fichier OPML à partir des flux RSS définis dans guests.json
// Usage : node generate-opml.mjs [output.opml]

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const outputFile = process.argv[2] ?? 'cuistops-guests.opml';
const guests = JSON.parse(readFileSync(resolve('guests.json'), 'utf8'));

const withRss = guests.filter(g => g.rss);

if (withRss.length === 0) {
  console.error('Aucun flux RSS trouvé dans guests.json');
  process.exit(1);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const date = new Date().toUTCString();

const outlines = withRss.map(g => {
  return `      <outline type="rss" text="${esc(g.name)}" title="${esc(g.name)} — ${esc(g.title)}" xmlUrl="${esc(g.rss)}" htmlUrl="${esc(g.blog ?? g.rss)}"/>`;
}).join('\n');

const opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>CuistOps — Blogs des guests &amp; cuistots</title>
    <dateCreated>${date}</dateCreated>
  </head>
  <body>
    <outline text="CuistOps">
${outlines}
    </outline>
  </body>
</opml>
`;

writeFileSync(outputFile, opml, 'utf8');
console.log(`OPML généré : ${outputFile} (${withRss.length} flux)`);
