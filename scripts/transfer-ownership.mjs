#!/usr/bin/env node
// Rebrands the business to a new owner after a sale.
//   npm run transfer -- path/to/new-owner.json [--date YYYY-MM-DD]
// Updates business.config.json (owner fields only), bumps the policy version so
// every user is asked to review the updated terms, sets the effective date,
// updates the LICENSE copyright holder, and regenerates every legal page.
// App IDs and subscription product IDs are never changed, so subscribers keep Pro.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const OWNER_FIELDS = [
  'legalEntityName', 'entityType', 'registeredAddress', 'companyNumber', 'taxId', 'supportEmail', 'privacyEmail',
  'websiteUrl', 'governingLaw', 'jurisdictionCourts', 'euRepresentative', 'ukRepresentative', 'hostingProvider', 'emailProvider',
];

export function bumpMinor(version) {
  const [major, minor] = String(version).split('.').map(Number);
  return `${major}.${(minor || 0) + 1}.0`;
}

export function applyTransfer(config, owner, date) {
  const unknown = Object.keys(owner).filter((k) => !k.startsWith('$') && !OWNER_FIELDS.includes(k));
  if (unknown.length) throw new Error(`These fields can't be changed by a transfer: ${unknown.join(', ')}`);
  const missing = OWNER_FIELDS.filter((k) => !owner[k] || /\[[^\]]+\]/.test(String(owner[k])));
  if (missing.length) throw new Error(`Fill in these fields first: ${missing.join(', ')}`);
  const next = structuredClone(config);
  for (const k of OWNER_FIELDS) next[k] = owner[k];
  next.policyVersion = bumpMinor(config.policyVersion);
  next.effectiveDate = date;
  return next;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const dateIdx = args.indexOf('--date');
  const date = dateIdx >= 0 ? args[dateIdx + 1] : new Date().toISOString().slice(0, 10);
  if (!file || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('Usage: npm run transfer -- path/to/new-owner.json [--date YYYY-MM-DD]');
    process.exit(1);
  }
  const configPath = join(root, 'business.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  let owner;
  let next;
  try {
    owner = JSON.parse(readFileSync(resolve(file), 'utf8'));
    next = applyTransfer(config, owner, date);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  writeFileSync(configPath, JSON.stringify(next, null, 2) + '\n');

  const licensePath = join(root, 'LICENSE');
  writeFileSync(
    licensePath,
    readFileSync(licensePath, 'utf8').replace(/^Copyright \(c\) .*$/m, `Copyright (c) ${date.slice(0, 4)} ${owner.legalEntityName}. All rights reserved.`)
  );

  execFileSync(process.execPath, [join(root, 'scripts/build-legal.mjs')], { stdio: 'inherit' });

  console.log(`
Ownership details updated to ${owner.legalEntityName}.
Policy version ${config.policyVersion} → ${next.policyVersion} (users will be asked to review the new terms).

Next:
  1. npm run check:business   (confirm nothing is left as a placeholder)
  2. npm run check            (contrast, tests, typecheck, lint)
  3. Review the generated legal pages, then commit.
  4. Redeploy the website and ship an app update.
  5. Send the notices in docs/ownership-transfer/06-Customer-Notices.md.`);
}
