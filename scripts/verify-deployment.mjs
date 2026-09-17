import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const catalog = JSON.parse(
  await readFile(new URL('../src/catalog.json', import.meta.url), 'utf8'),
);

// Test the actual artifact, not the development-server entry point.
const output = path.resolve(process.argv[2] || 'dist');
const html = await readFile(path.join(output, 'index.html'), 'utf8');
assert.doesNotMatch(html, /(?:src|href)=["']\/?src\//, 'Deploy the Vite dist folder, not the source repository.');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(match => match[1]);
const styles = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/g)].map(match => match[1]);
assert.ok(scripts.length && styles.length, 'The deployment must include bundled JavaScript and CSS.');
const origin = new URL('https://example.github.io/Unit-Page/');
for (const asset of [...scripts, ...styles]) {
  const url = new URL(asset, origin);
  assert.equal(url.origin, origin.origin, 'Bundle assets must be part of this deployment.');
  assert.ok(url.pathname.startsWith(origin.pathname), `Asset escapes the GitHub Pages repository path: ${asset}`);
  await access(path.join(output, url.pathname.slice(origin.pathname.length)));
}
for (const unit of catalog.units) {
  const sharePage = await readFile(
    path.join(output, 'units', unit.id, 'index.html'),
    'utf8',
  );
  assert.match(sharePage, new RegExp(`<meta property="og:title" content="Unit `));
  assert.ok(sharePage.includes(`/Unit-Page/units/${unit.id}/`));
  assert.ok(sharePage.includes(`../../#/units/${unit.id}`));
}
console.log(`Deployment verified: bundles resolve under /Unit-Page/ and ${catalog.units.length} unit share pages include social metadata.`);
