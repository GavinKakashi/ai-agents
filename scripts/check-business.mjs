#!/usr/bin/env node
// Lists placeholder values in business.config.json and app.json that must be
// replaced before launch. Exits non-zero if any remain, so it can gate release.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];

const config = JSON.parse(readFileSync(join(root, 'business.config.json'), 'utf8'));
(function walk(obj, path) {
  for (const [k, v] of Object.entries(obj)) {
    if (k === '$comment') continue;
    if (v && typeof v === 'object') walk(v, `${path}${k}.`);
    else if (typeof v === 'string' && /\[[^\]]+\]/.test(v)) problems.push(`business.config.json → ${path}${k}: ${v}`);
  }
})(config, '');

const app = JSON.parse(readFileSync(join(root, 'apps/mobile/app.json'), 'utf8')).expo;
for (const [label, value] of [['ios.bundleIdentifier', app.ios?.bundleIdentifier], ['android.package', app.android?.package]]) {
  if (String(value).startsWith('com.example.')) problems.push(`apps/mobile/app.json → ${label}: ${value}`);
}

if (problems.length) {
  console.error(`${problems.length} placeholder(s) to replace before launch:\n` + problems.map((p) => `  • ${p}`).join('\n'));
  console.error('\nThen run `npm run build:legal` to regenerate the policies.');
  process.exit(1);
}
console.log('No placeholders found. Remember to run `npm run build:legal`.');
