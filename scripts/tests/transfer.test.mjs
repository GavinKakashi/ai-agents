import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyTransfer, bumpMinor, OWNER_FIELDS } from '../transfer-ownership.mjs';

const config = JSON.parse(readFileSync(new URL('../../business.config.json', import.meta.url), 'utf8'));
const owner = JSON.parse(readFileSync(new URL('../../docs/ownership-transfer/new-owner.example.json', import.meta.url), 'utf8'));

test('bumps the minor policy version', () => {
  assert.equal(bumpMinor('1.1.0'), '1.2.0');
  assert.equal(bumpMinor('2.9.3'), '2.10.0');
});

test('applies owner fields, keeps product IDs, and forces re-consent', () => {
  const next = applyTransfer(config, owner, '2027-01-02');
  for (const k of OWNER_FIELDS) assert.equal(next[k], owner[k]);
  assert.deepEqual(next.pricing, config.pricing);
  assert.notEqual(next.policyVersion, config.policyVersion);
  assert.equal(next.effectiveDate, '2027-01-02');
});

test('refuses to change subscription or app identifiers', () => {
  assert.throws(() => applyTransfer(config, { ...owner, pricing: {} }, '2027-01-02'), /can't be changed/);
});

test('refuses placeholders or missing fields', () => {
  assert.throws(() => applyTransfer(config, { ...owner, legalEntityName: '[NAME]' }, '2027-01-02'), /Fill in/);
});
