# Crewdeck

**Manage your AI agents from your phone.** Crewdeck is a local-first iOS, Android and web app for creating, configuring and running Claude-powered AI agents with your own Anthropic API key — plus the website and privacy-request service that go with it.

- No account, no analytics, no ads, no tracking. Agents and conversations stay on the device.
- The API key lives in the iOS Keychain / Android Keystore (web: memory only).
- Messages go straight from the device to Anthropic.
- Privacy policy, terms, refund and cookie policies, an accessibility statement and an SDK audit, generated from one source into both the app and the website.

## What's in the repo

| Path | What it is |
|---|---|
| `apps/mobile` | The app: Expo SDK 57, React Native, Expo Router, TypeScript |
| `apps/web/src` | Website templates: landing page, cookie banner, privacy-request, confirm and unsubscribe pages |
| `apps/server` | Zero-dependency Node server for the website, double-opt-in updates, one-click unsubscribe and privacy requests, plus an operator CLI |
| `legal/` | Policies in Markdown with `{{placeholders}}`: the single source for the app and the website |
| `business.config.json` | All business details: company, address, emails, price wording, policy version |
| `scripts/` | Legal/website build, contrast checker, licence collector, placeholder checker, tests |
| `docs/` | Compliance checklist, subscriptions setup, app-store notes, rebranding guide, source-code licence template, ownership-transfer pack |

## Features

- **Agents:** create from templates or from scratch; name, instructions, model (Claude Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.1), effort and reply length; pause, resume, duplicate, delete.
- **Conversations:** chat with any agent, retry failed messages, delete. History is replayed to the API unchanged (append-only), and safety-refusal fallback is enabled on models that support it.
- **Usage:** token counts and an estimated cost per reply, plus totals on the home screen.
- **Crewdeck Pro subscription:** monthly and yearly plans through the App Store and Google Play (`expo-iap`, no third-party subscription service). Free plan: 3 agents. Pro: unlimited agents and the Pro template library. Restore and manage are built in.
- **Privacy center:** export everything as JSON, delete everything, withdraw consent, make a privacy request.
- **Accessibility:** screen-reader labels, roles and states throughout; ≥ 44 pt targets; system text scaling; WCAG AA contrast enforced by a script; keyboard support on the web.
- **Light and dark** themes, plus a manual override.

## Quick start

```bash
# Website + privacy-request service on http://localhost:3000
npm start

# Mobile app (scan the QR code with Expo Go, or press w for the web build)
cd apps/mobile && npm install && npx expo start
```

## Run on Replit

1. In Replit choose **Create Repl → Import from GitHub** and pick this repository.
2. Press **Run**. This builds the policies and starts the website on port 3000.
3. **Deploy** publishes it. On Replit, data is stored in Replit Database automatically (`REPLIT_DB_URL`), because deployments have no persistent disk.
4. To try the mobile app from Replit: open the Shell, run `cd apps/mobile && npm install && npx expo start --tunnel`, and scan the QR code with Expo Go.

## Scripts (repo root)

| Command | What it does |
|---|---|
| `npm run build:legal` | Regenerates the in-app policies and the website from `legal/` and `business.config.json` |
| `npm run check:business` | Lists placeholders still to be replaced (fails until there are none) |
| `npm run check:contrast` | Verifies WCAG AA contrast for every colour pair in the app and website |
| `npm run notices` | Rebuilds `THIRD_PARTY_NOTICES.md` and the in-app licence list; fails on unreviewed licences |
| `npm test` | Server, Markdown and contrast tests |
| `npm run check` | Contrast + tests + mobile typecheck + lint |
| `npm run transfer -- <new-owner.json>` | Rebrands every policy, page and `LICENSE` to a new owner after a sale |
| `npm run admin -- <cmd>` | Privacy-request and mailing-list operations (see `apps/server/admin.mjs`) |

## Selling the business

Everything for a sale is in **[docs/ownership-transfer/](docs/ownership-transfer/README.md)**: asset inventory, purchase agreement, IP assignment, Apple and Google app transfer steps, subscriber continuity, customer notices and the closing checklist.

## Before launch

Read **[docs/COMPLIANCE.md](docs/COMPLIANCE.md)**. In short: fill in `business.config.json`, set your bundle IDs, have the policies legally reviewed, configure email, and check the name "Crewdeck" for trademark conflicts.

## Licence

Proprietary. See [LICENSE](LICENSE). Open-source components: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
