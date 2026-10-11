import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { sendMail } from './mailer.mjs';
import { business, baseUrl } from './config.mjs';

const DAY = 24 * 60 * 60 * 1000;
export const PENDING_TTL = 7 * DAY;
export const CLOSED_REQUEST_TTL = 730 * DAY; // 24 months, per the Privacy Policy

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const REQUEST_TYPES = new Set(['access', 'deletion', 'correction', 'portability', 'restriction', 'withdraw-consent', 'other']);
export const CONSENT_TEXT = `I'd like to receive product update emails from ${business.appName}. I can unsubscribe at any time.`;

const token = () => randomBytes(24).toString('base64url');
const normalise = (email) => String(email || '').trim().toLowerCase();
export const emailHash = (email) => createHash('sha256').update(normalise(email)).digest('hex');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireEmail(value) {
  const email = normalise(value);
  if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, 'Please enter a valid email address.');
  return email;
}

export function createHandlers(store) {
  return {
    async subscribe(body) {
      const email = requireEmail(body.email);
      // Consent must be an explicit, affirmative action (unticked box ticked).
      if (body.consent !== 'yes') throw new HttpError(400, 'Please tick the box to confirm you want product updates.');
      const message = 'Thanks! Check your inbox for a confirmation email. We will only email you after you confirm.';
      const existing = store.data.subscribers.find((s) => s.email === email);
      if (existing?.status === 'confirmed') return { message }; // same reply: no account enumeration

      const record = store.update((d) => {
        d.subscribers = d.subscribers.filter((s) => s.email !== email);
        const r = {
          id: randomUUID(),
          email,
          status: 'pending',
          consentText: CONSENT_TEXT,
          consentAt: new Date().toISOString(),
          confirmToken: token(),
          unsubscribeToken: token(),
        };
        d.subscribers.push(r);
        return r;
      });
      await sendMail({
        to: email,
        subject: `Confirm your ${business.appName} product updates`,
        text: `Someone (hopefully you) asked to receive ${business.appName} product updates at this address.\n\nConfirm here: ${baseUrl}/confirm.html?token=${record.confirmToken}\n\nIf this wasn't you, ignore this email. We won't email you again, and we'll delete this address within 7 days.`,
      });
      return { message };
    },

    async confirm(body) {
      const t = String(body.token || '');
      const ok = store.update((d) => {
        const s = d.subscribers.find((x) => x.confirmToken === t && x.status === 'pending');
        if (!s) return false;
        s.status = 'confirmed';
        s.confirmedAt = new Date().toISOString();
        delete s.confirmToken;
        d.suppression = d.suppression.filter((h) => h !== emailHash(s.email));
        return true;
      });
      if (!ok) throw new HttpError(400, 'This confirmation link is invalid or has expired.');
      return { message: 'Your subscription is confirmed. You can unsubscribe at any time from any email.' };
    },

    async unsubscribe(body) {
      const t = String(body.token || '');
      store.update((d) => {
        const s = d.subscribers.find((x) => x.unsubscribeToken === t);
        if (!s) return;
        d.subscribers = d.subscribers.filter((x) => x !== s);
        // Keep only a one-way hash so we never email this address again by mistake.
        if (!d.suppression.includes(emailHash(s.email))) d.suppression.push(emailHash(s.email));
      });
      // Always succeed: unsubscribing must never fail or require extra steps.
      return { message: "You're unsubscribed and your email address has been deleted." };
    },

    async privacyRequest(body) {
      const email = requireEmail(body.email);
      if (!REQUEST_TYPES.has(body.type)) throw new HttpError(400, 'Please choose a request type.');
      if (body.confirm !== 'yes') throw new HttpError(400, 'Please confirm you are the person concerned or authorised to act for them.');
      const details = String(body.details || '').slice(0, 2000);
      const req = store.update((d) => {
        const r = { id: randomUUID(), email, type: body.type, details, status: 'open', createdAt: new Date().toISOString() };
        d.privacyRequests.push(r);
        return r;
      });
      await sendMail({
        to: email,
        subject: `We received your privacy request (${req.id.slice(0, 8)})`,
        text: `We received your ${req.type} request on ${req.createdAt.slice(0, 10)}. We will reply within one month (45 days for California residents). If we need to confirm your identity, we will contact you at this address.\n\nReference: ${req.id}`,
      });
      await sendMail({
        to: business.privacyEmail,
        subject: `New privacy request: ${req.type} (${req.id.slice(0, 8)})`,
        text: `Type: ${req.type}\nFrom: ${email}\nReceived: ${req.createdAt}\nReference: ${req.id}\n\n${details || '(no details)'}\n\nHandle with: npm run admin -- show ${req.id}`,
      });
      return { message: `Request received. Your reference is ${req.id.slice(0, 8)}. We've emailed you a confirmation.` };
    },
  };
}

/** Delete data we no longer need (run on startup and daily). */
export function purgeExpired(store, now = Date.now()) {
  store.update((d) => {
    d.subscribers = d.subscribers.filter((s) => s.status !== 'pending' || now - Date.parse(s.consentAt) < PENDING_TTL);
    d.privacyRequests = d.privacyRequests.filter(
      (r) => r.status !== 'closed' || now - Date.parse(r.closedAt) < CLOSED_REQUEST_TTL
    );
  });
}

export { HttpError };
