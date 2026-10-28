const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));

test('index.html existe', () => {
  assert.ok(fs.existsSync(path.join(root, 'index.html')));
});

test('chaque page a un <title>', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /<title>[^<]+<\/title>/i, `${page} : <title> manquant`);
  }
});

test('les liens et images locaux existent', () => {
  const re = /(?:href|src)="([^"]+)"/g;
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    for (const [, link] of html.matchAll(re)) {
      if (/^(https?:|\/\/|#|mailto:|tel:|javascript:|data:)/i.test(link)) continue;
      const clean = decodeURIComponent(link.split(/[?#]/)[0]);
      if (!clean) continue;
      const target = clean.startsWith('/')
        ? path.join(root, clean)
        : path.join(root, clean);
      assert.ok(fs.existsSync(target), `${page} : fichier introuvable → ${link}`);
    }
  }
});