import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../../apps/server/lib/store.mjs';
import { createHandlers, purgeExpired, emailHash, PENDING_TTL } from '../../apps/server/lib/handlers.mjs';

// Silence the console email transport during tests.
console.log = () => {};

const fresh = async () => {
  const store = await createStore(mkdtempSync(join(tmpdir(), 'crewdeck-')), { replitDbUrl: '' });
  return { store, h: createHandlers(store) };
};

test('subscribe requires explicit consent', async () => {
  const { h } = await fresh();
  await assert.rejects(h.subscribe({ email: 'a@b.co' }), /tick the box/);
  await assert.rejects(h.subscribe({ email: 'a@b.co', consent: 'on' }), /tick the box/);
});

test('double opt-in, then unsubscribe deletes the address and keeps only a hash', async () => {
  const { store, h } = await fresh();
  await h.subscribe({ email: 'A@B.co ', consent: 'yes' });
  const sub = store.data.subscribers[0];
  assert.equal(sub.email, 'a@b.co');
  assert.equal(sub.status, 'pending');
  assert.ok(sub.consentText && sub.consentAt);
  await h.confirm({ token: sub.confirmToken });
  assert.equal(store.data.subscribers[0].status, 'confirmed');
  await h.unsubscribe({ token: sub.unsubscribeToken });
  assert.equal(store.data.subscribers.length, 0);
  assert.deepEqual(store.data.suppression, [emailHash('a@b.co')]);
  assert.ok(!JSON.stringify(store.data).includes('a@b.co'));
});

test('unsubscribe with an unknown token still succeeds', async () => {
  const { h } = await fresh();
  const r = await h.unsubscribe({ token: 'nope' });
  assert.match(r.message, /unsubscribed/);
});

test('privacy requests validate type and authority', async () => {
  const { store, h } = await fresh();
  await assert.rejects(h.privacyRequest({ email: 'a@b.co', type: 'hack', confirm: 'yes' }), /request type/);
  await assert.rejects(h.privacyRequest({ email: 'a@b.co', type: 'access' }), /confirm/);
  await h.privacyRequest({ email: 'a@b.co', type: 'access', confirm: 'yes', details: 'x'.repeat(5000) });
  assert.equal(store.data.privacyRequests[0].details.length, 2000);
});

test('unconfirmed subscriptions are purged after 7 days', async () => {
  const { store, h } = await fresh();
  await h.subscribe({ email: 'a@b.co', consent: 'yes' });
  purgeExpired(store, Date.now() + PENDING_TTL + 1000);
  assert.equal(store.data.subscribers.length, 0);
});

test('data survives a restart (file backend)', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'crewdeck-'));
  const a = await createStore(dir, { replitDbUrl: '' });
  await createHandlers(a).privacyRequest({ email: 'a@b.co', type: 'access', confirm: 'yes' });
  await a.flush();
  const b = await createStore(dir, { replitDbUrl: '' });
  assert.equal(b.data.privacyRequests.length, 1);
});
