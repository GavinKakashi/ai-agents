// Tiny data store. The whole dataset is one small JSON document, kept in
// memory and saved after every change. Two backends:
//   - Replit Database, used automatically when REPLIT_DB_URL is set (Replit
//     deployments have no persistent disk, so this is required there);
//   - a local JSON file with atomic writes, everywhere else.
// Swap for a real database if you run more than one instance.
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const EMPTY = { subscribers: [], suppression: [], privacyRequests: [] };
const REPLIT_KEY = 'crewdeck_db';

function fileBackend(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const file = join(dataDir, 'db.json');
  return {
    async load() {
      return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    },
    async save(json) {
      const tmp = `${file}.tmp`;
      writeFileSync(tmp, json, { mode: 0o600 });
      renameSync(tmp, file);
    },
  };
}

function replitBackend(url) {
  return {
    async load() {
      const res = await fetch(`${url}/${REPLIT_KEY}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Replit DB read failed: ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    async save(json) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `${encodeURIComponent(REPLIT_KEY)}=${encodeURIComponent(json)}`,
      });
      if (!res.ok) throw new Error(`Replit DB write failed: ${res.status}`);
    },
  };
}

export async function createStore(dataDir, { replitDbUrl = process.env.REPLIT_DB_URL } = {}) {
  const backend = replitDbUrl ? replitBackend(replitDbUrl) : fileBackend(dataDir);
  let data = { ...structuredClone(EMPTY), ...((await backend.load()) ?? {}) };
  let saving = Promise.resolve();

  return {
    get data() {
      return data;
    },
    /** Apply a mutation; the save is queued so writes never interleave. */
    update(fn) {
      const result = fn(data);
      const snapshot = JSON.stringify(data);
      saving = saving.then(() => backend.save(snapshot)).catch((err) => console.error('Failed to save data:', err));
      return result;
    },
    /** Resolves once every queued save has finished. */
    flush() {
      return saving;
    },
  };
}
