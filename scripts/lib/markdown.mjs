// Minimal Markdown parser for the legal documents. It supports exactly the
// subset those documents use: headings, paragraphs, bullet lists, tables,
// **bold** and `code`. Output is a small block AST that both the website
// (HTML) and the mobile app (React Native) render, so the text is identical.

export function parseBlocks(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, '').trim());
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }
    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ type: 'table', header: rows[0], rows: rows.slice(1) });
      continue;
    }
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('|')
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', text: para.join(' ') });
  }
  return blocks;
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inlineToHtml(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Link bare https URLs and email addresses that are not placeholders.
  html = html.replace(/(^|[\s(])(https:\/\/[^\s<)\]]+[^\s<)\].,;])/g, '$1<a href="$2">$2</a>');
  html = html.replace(
    /(^|[\s(])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    '$1<a href="mailto:$2">$2</a>'
  );
  return html;
}

export function blocksToHtml(blocks) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
          return `<h${b.level}>${inlineToHtml(b.text)}</h${b.level}>`;
        case 'paragraph':
          return `<p>${inlineToHtml(b.text)}</p>`;
        case 'list':
          return `<ul>${b.items.map((it) => `<li>${inlineToHtml(it)}</li>`).join('')}</ul>`;
        case 'table':
          return `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(
            b.header.join(', ')
          )}"><table><thead><tr>${b.header
            .map((h) => `<th scope="col">${inlineToHtml(h)}</th>`)
            .join('')}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inlineToHtml(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table></div>`;
        default:
          return '';
      }
    })
    .join('\n');
}

export function parseFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta = Object.fromEntries(
    m[1].split('\n').map((l) => {
      const idx = l.indexOf(':');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
  );
  return { meta, body: src.slice(m[0].length) };
}

export function fillTemplate(text, config) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (whole, key) => {
    const value = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), config);
    if (value === undefined) throw new Error(`Unknown template key: ${key}`);
    return String(value);
  });
}
