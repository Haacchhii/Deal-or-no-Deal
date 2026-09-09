import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

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
console.log('Deployment verified: built HTML, JavaScript and CSS resolve under /Unit-Page/.');
