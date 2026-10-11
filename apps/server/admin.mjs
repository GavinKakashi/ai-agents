#!/usr/bin/env node
// Operator CLI for privacy requests and product-update emails.
//   npm run admin -- requests                 list open privacy requests
//   npm run admin -- show <id>                show one request
//   npm run admin -- export <email>           print all data held about an email (access/portability)
//   npm run admin -- delete <email>           delete all data held about an email (erasure)
//   npm run admin -- close <id> [note]        mark a request as closed
//   npm run admin -- send-update <subject> <body.txt>   email confirmed subscribers
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rootDir, baseUrl } from './lib/config.mjs';
import { createStore } from './lib/store.mjs';
import { emailHash } from './lib/handlers.mjs';
import { sendMail } from './lib/mailer.mjs';

const store = await createStore(process.env.DATA_DIR || join(rootDir, 'apps/server/data'));
const [cmd, ...args] = process.argv.slice(2);
const norm = (e) => String(e || '').trim().toLowerCase();

switch (cmd) {
  case 'requests':
    console.table(store.data.privacyRequests.filter((r) => r.status === 'open').map(({ id, email, type, createdAt }) => ({ id, email, type, createdAt })));
    break;
  case 'show':
    console.log(store.data.privacyRequests.find((r) => r.id.startsWith(args[0])) || 'Not found');
    break;
  case 'export': {
    const email = norm(args[0]);
    console.log(JSON.stringify({
      subscriptions: store.data.subscribers.filter((s) => s.email === email).map(({ confirmToken, unsubscribeToken, ...s }) => s),
      privacyRequests: store.data.privacyRequests.filter((r) => r.email === email),
      onSuppressionList: store.data.suppression.includes(emailHash(email)),
    }, null, 2));
    break;
  }
  case 'delete': {
    const email = norm(args[0]);
    store.update((d) => {
      d.subscribers = d.subscribers.filter((s) => s.email !== email);
      // Requests are kept (legal obligation to record that we handled them) but
      // their free-text details are erased.
      d.privacyRequests.forEach((r) => {
        if (r.email === email) r.details = '[erased]';
      });
    });
    console.log(`Deleted subscription data for ${email}. Request records kept as evidence of handling, details erased.`);
    break;
  }
  case 'close':
    store.update((d) => {
      const r = d.privacyRequests.find((x) => x.id.startsWith(args[0]));
      if (!r) throw new Error('Not found');
      r.status = 'closed';
      r.closedAt = new Date().toISOString();
      r.note = args.slice(1).join(' ');
    });
    console.log('Closed.');
    break;
  case 'send-update': {
    const [subject, bodyFile] = args;
    const text = readFileSync(bodyFile, 'utf8');
    const recipients = store.data.subscribers.filter(
      (s) => s.status === 'confirmed' && !store.data.suppression.includes(emailHash(s.email))
    );
    for (const s of recipients) {
      await sendMail({
        to: s.email,
        subject,
        text,
        unsubscribeUrl: `${baseUrl}/unsubscribe.html?token=${s.unsubscribeToken}`,
        oneClickUrl: `${baseUrl}/api/unsubscribe?token=${s.unsubscribeToken}`,
      });
    }
    console.log(`Sent to ${recipients.length} confirmed subscriber(s).`);
    break;
  }
  default:
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 9).join('\n'));
}

await store.flush();
