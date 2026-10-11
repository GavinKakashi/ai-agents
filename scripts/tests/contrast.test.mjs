import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('all colour pairs meet WCAG AA', () => {
  const out = execFileSync(process.execPath, [fileURLToPath(new URL('../check-contrast.mjs', import.meta.url))]).toString();
  assert.match(out, /All contrast checks passed/);
});
