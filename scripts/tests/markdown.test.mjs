import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks, blocksToHtml, fillTemplate, inlineToHtml } from '../lib/markdown.mjs';

test('parses headings, lists, tables and paragraphs', () => {
  const blocks = parseBlocks('## Title\n\nSome **bold** text\nwraps.\n\n- one\n- two\n\n| A | B |\n|---|---|\n| 1 | 2 |\n');
  assert.deepEqual(blocks.map((b) => b.type), ['heading', 'paragraph', 'list', 'table']);
  assert.equal(blocks[1].text, 'Some **bold** text wraps.');
  assert.deepEqual(blocks[3].rows, [['1', '2']]);
});

test('escapes HTML and links emails and https URLs', () => {
  const html = inlineToHtml('<script> mail me@example.com or see https://example.com.');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('<a href="mailto:me@example.com">'));
  assert.ok(html.includes('<a href="https://example.com">https://example.com</a>.'));
});

test('tables render with column headers for screen readers', () => {
  const html = blocksToHtml(parseBlocks('| A | B |\n|---|---|\n| 1 | 2 |'));
  assert.ok(html.includes('<th scope="col">A</th>'));
});

test('fillTemplate supports nested keys and rejects unknown ones', () => {
  assert.equal(fillTemplate('{{a.b}}!', { a: { b: 'hi' } }), 'hi!');
  assert.throws(() => fillTemplate('{{missing}}', {}), /Unknown template key/);
});
