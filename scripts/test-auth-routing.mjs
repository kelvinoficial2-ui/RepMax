import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { canonicalAppUrl, APP_HOST } from '../lib/app-origin.mjs';

assert.equal(canonicalAppUrl('https://repmax-c5c87.web.app/?v=6'), `https://${APP_HOST}/?v=6`);
assert.equal(canonicalAppUrl(`https://${APP_HOST}/?v=6`), null);
assert.equal(canonicalAppUrl('http://localhost:5173/'), null);
assert.equal(canonicalAppUrl('https://repmax-c5c87.web.app/__/auth/handler'), null);
assert.equal(canonicalAppUrl('https://repmax-c5c87.web.app.evil.example/'), null);
assert.equal(canonicalAppUrl(canonicalAppUrl('https://repmax-c5c87.web.app/')), null);
const handlers = {};
vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
  URL,
  self: { location: { origin: `https://${APP_HOST}` }, addEventListener: (name, fn) => { handlers[name] = fn; } },
});
for (const url of [`https://${APP_HOST}/__/auth/handler`, `https://${APP_HOST}/__/auth/iframe`, 'https://accounts.google.com/']) {
  handlers.fetch({ request: { method: 'GET', url }, respondWith: () => assert.fail('Auth request intercepted') });
}
console.log('PASS: one-way domain migration, local development, auth helper exclusions, external URL exclusions');
