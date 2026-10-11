// Email sending. Default transport prints emails to the console so the
// project runs with zero configuration. Set SMTP_URL (e.g.
// smtps://user:pass@smtp.example.com:465) and install the optional
// `nodemailer` dependency to send real email. See docs/third-party-sdk-audit.md.
import { business } from './config.mjs';

let transport;

async function getTransport() {
  if (transport) return transport;
  if (process.env.SMTP_URL) {
    const { default: nodemailer } = await import('nodemailer');
    const smtp = nodemailer.createTransport(process.env.SMTP_URL);
    transport = { send: (msg) => smtp.sendMail(msg) };
  } else {
    transport = {
      send: async (msg) => {
        console.log(`\n--- email (console transport) ---\nTo: ${msg.to}\nSubject: ${msg.subject}\n` +
          `${Object.entries(msg.headers || {}).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${msg.text}\n--- end ---\n`);
      },
    };
  }
  return transport;
}

const footer = (extra = '') =>
  `\n\n—\n${business.legalEntityName}, ${business.registeredAddress}\n${extra}`;

/**
 * Send an email. Marketing/product-update emails MUST pass `unsubscribeUrl`:
 * it is added to the body and as RFC 2369 / RFC 8058 one-click headers.
 */
export async function sendMail({ to, subject, text, unsubscribeUrl, oneClickUrl }) {
  const headers = {};
  let body = text;
  if (unsubscribeUrl) {
    body += footer(`You're receiving this because you subscribed to ${business.appName} product updates.\nUnsubscribe instantly: ${unsubscribeUrl}`);
    headers['List-Unsubscribe'] = `<${oneClickUrl || unsubscribeUrl}>, <mailto:${business.privacyEmail}?subject=unsubscribe>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  } else {
    body += footer();
  }
  const from = process.env.MAIL_FROM || `${business.appName} <${business.supportEmail}>`;
  await (await getTransport()).send({ from, to, subject, text: body, headers });
}
