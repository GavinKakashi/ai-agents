#!/usr/bin/env node
// Crewdeck website + privacy-request service. Zero runtime dependencies.
//   PORT        port to listen on (default 3000)
//   DATA_DIR    where db.json lives (default apps/server/data)
//   PUBLIC_URL  public base URL for links in emails (default: websiteUrl in business.config.json)
//   SMTP_URL    optional; send real email via nodemailer instead of logging it
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { rootDir } from './lib/config.mjs';
import { createStore } from './lib/store.mjs';
import { createHandlers, purgeExpired, HttpError } from './lib/handlers.mjs';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = join(rootDir, 'apps/web/public');
const store = await createStore(process.env.DATA_DIR || join(rootDir, 'apps/server/data'));
const handlers = createHandlers(store);

const routes = {
  '/api/subscribe': handlers.subscribe,
  '/api/confirm': handlers.confirm,
  '/api/unsubscribe': handlers.unsubscribe,
  '/api/privacy-request': handlers.privacyRequest,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// In-memory rate limit keyed by a salted IP hash. Never written to disk; the
// salt changes on every restart so hashes cannot be linked over time.
const RATE_SALT = randomBytes(16);
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;
const hits = new Map();
function rateLimited(req) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const key = createHash('sha256').update(RATE_SALT).update(ip).digest('hex');
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > RATE_WINDOW) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (now - v.start > RATE_WINDOW) hits.delete(k);
}, 10 * 60 * 1000).unref();

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}
const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json' });

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw new HttpError(413, 'Request too large.');
  }
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) {
    try {
      return JSON.parse(raw || '{}');
    } catch {
      throw new HttpError(400, 'Invalid request.');
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

async function handleApi(req, res, url) {
  const handler = routes[url.pathname];
  if (!handler) return json(res, 404, { message: 'Not found.' });
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed.' });
  if (rateLimited(req)) return json(res, 429, { message: 'Too many requests. Please try again later.' });
  try {
    const body = await readBody(req);
    // RFC 8058 one-click unsubscribe sends the token in the query string.
    if (!body.token && url.searchParams.get('token')) body.token = url.searchParams.get('token');
    // Honeypot: real people never fill this hidden field. Pretend success.
    if (body.website) return json(res, 200, { message: 'Thanks!' });
    json(res, 200, await handler(body));
  } catch (err) {
    if (err instanceof HttpError) return json(res, err.status, { message: err.message });
    console.error(err);
    json(res, 500, { message: 'Something went wrong on our side. Please email us instead.' });
  }
}

async function serveStatic(req, res, url) {
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(PUBLIC_DIR, path));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    const body = await readFile(file);
    send(res, 200, req.method === 'HEAD' ? undefined : body, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
  } catch {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res, url);
});

purgeExpired(store);
setInterval(() => purgeExpired(store), 24 * 60 * 60 * 1000).unref();

server.listen(PORT, '0.0.0.0', () => console.log(`Crewdeck web listening on http://0.0.0.0:${PORT}`));
