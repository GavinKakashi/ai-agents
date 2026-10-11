#!/usr/bin/env node
// Verifies WCAG 2.2 AA contrast for every colour pairing used in the app and
// website. Exits non-zero on failure so it can gate CI.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function luminance(hex) {
  const [r, g, b] = hex.replace('#', '').match(/../g).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ---- Parse app theme ------------------------------------------------------
const themeSrc = readFileSync(join(root, 'apps/mobile/src/constants/theme.ts'), 'utf8');
function parseScheme(name) {
  const block = new RegExp(`${name}: \\{([\\s\\S]*?)\\}`).exec(themeSrc)[1];
  return Object.fromEntries([...block.matchAll(/(\w+): '(#[0-9A-Fa-f]{6})'/g)].map((m) => [m[1], m[2]]));
}
const avatars = [.../AvatarColors = \[([^\]]+)\]/.exec(themeSrc)[1].matchAll(/'(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1]);

const TEXT = 4.5;
const UI = 3;
const pairs = [
  ['text', 'background', TEXT], ['text', 'surface', TEXT], ['text', 'surfaceAlt', TEXT],
  ['textSecondary', 'background', TEXT], ['textSecondary', 'surface', TEXT], ['textSecondary', 'surfaceAlt', TEXT],
  ['primary', 'background', TEXT], ['primary', 'surface', TEXT], ['primary', 'surfaceAlt', TEXT],
  ['onPrimary', 'primary', TEXT], ['onDanger', 'danger', TEXT],
  ['danger', 'background', TEXT], ['danger', 'surface', TEXT],
  ['success', 'background', TEXT], ['success', 'surface', TEXT],
  ['warning', 'background', TEXT], ['warning', 'surface', TEXT],
  ['border', 'background', UI], ['border', 'surface', UI],
];

let failures = 0;
function check(label, fg, bg, min) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)}:1 (min ${min})  ${label}`);
}

for (const scheme of ['light', 'dark']) {
  const c = parseScheme(scheme);
  for (const [fg, bg, min] of pairs) check(`app ${scheme}: ${fg} on ${bg}`, c[fg], c[bg], min);
}
for (const a of avatars) check(`avatar: #FFFFFF on ${a}`, '#FFFFFF', a, TEXT);

// ---- Website must use the same values --------------------------------------
const css = readFileSync(join(root, 'apps/web/src/styles.css'), 'utf8');
const cssVars = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const webLight = cssVars(/:root \{([\s\S]*?)\}/.exec(css)[1]);
const webDark = cssVars(/prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}/.exec(css)[1]);
for (const [scheme, web] of [['light', webLight], ['dark', webDark]]) {
  check(`web ${scheme}: text on bg`, web.text, web.bg, TEXT);
  check(`web ${scheme}: text-secondary on bg`, web['text-secondary'], web.bg, TEXT);
  check(`web ${scheme}: text-secondary on surface`, web['text-secondary'], web.surface, TEXT);
  check(`web ${scheme}: primary on bg`, web.primary, web.bg, TEXT);
  check(`web ${scheme}: primary on surface`, web.primary, web.surface, TEXT);
  check(`web ${scheme}: on-primary on primary`, web['on-primary'], web.primary, TEXT);
  check(`web ${scheme}: danger on bg`, web.danger, web.bg, TEXT);
  check(`web ${scheme}: success on bg`, web.success, web.bg, TEXT);
  check(`web ${scheme}: border on bg`, web.border, web.bg, UI);
  check(`web ${scheme}: focus ring on bg`, web.focus, web.bg, UI);
}

if (failures) {
  console.error(`\n${failures} contrast check(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast checks passed.');
