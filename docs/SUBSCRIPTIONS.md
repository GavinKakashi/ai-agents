# Subscriptions: setup and testing

Crewdeck sells **Crewdeck Pro** as an auto-renewing subscription through the App Store and Google Play, using [`expo-iap`](https://openiap.dev) (StoreKit 2 / Play Billing). There is no subscription server and no third-party subscription service. The app asks the store on the device whether the user is subscribed.

## What Pro unlocks

Configured in code and `business.config.json`:

| | Free | Pro |
|---|---|---|
| Agents | up to `pricing.freeAgentLimit` (3) | unlimited |
| Templates | 4 standard | + Pro template library (`pro: true` in `apps/mobile/src/lib/templates.ts`) |
| Chat, all models, usage tracking | ✓ | ✓ |
| Privacy tools (export, delete, consent) | ✓ always free, by design | ✓ |

If a subscription lapses, existing agents keep working; the user just can't add more beyond the free limit. Gating lives in `apps/mobile/src/app/(tabs)/index.tsx`, `agent/new.tsx` and `agent/[id]/index.tsx`.

## 1. Choose product IDs

Set them once in `business.config.json` → `pricing.productIds`. Use the bundle ID as a prefix (for example `com.yourcompany.crewdeck.pro.monthly`). That keeps them unique, which Apple requires when the app is transferred to a buyer. **Never change them after launch.**

## 2. App Store Connect

1. Accept the **Paid Apps agreement**, and complete tax and banking (Business → Agreements).
2. App → **Subscriptions** → create a subscription group, for example "Crewdeck Pro".
3. Add two auto-renewable subscriptions with the IDs above: 1 month and 1 year. Set prices, display name and description, and a review screenshot of the paywall.
4. App Information → **License Agreement**: link to your Terms page. Add your Privacy Policy URL too.
5. For testing, create **Sandbox testers** (Users and Access → Sandbox).

## 3. Google Play Console

1. Set up a **payments profile** (merchant account).
2. Upload at least one build that includes billing to a testing track (Play needs this before you can create subscriptions).
3. Monetize → **Subscriptions** → create two subscriptions with the same product IDs, each with one auto-renewing **base plan** (monthly, yearly). Activate them.
4. Add **License testers** (Settings → License testing) to test without being charged.

## 4. Build and test

Subscriptions need native code, so they **do not work in Expo Go**. Use a development build:

```bash
cd apps/mobile
npx eas-cli@latest build --profile development --platform ios   # or android
npx expo start --dev-client
```

Test these cases on a device:

1. The paywall shows the store's localised prices for both plans. Neither plan is pre-selected.
2. Subscribe with a sandbox or license tester account → "Pro plan" appears on the home screen and the 4th agent can be created.
3. Kill and reopen the app → still Pro.
4. **Restore purchases** on a second device with the same store account → Pro.
5. **Manage subscription** opens the store's subscription page; cancel → after the (accelerated sandbox) period ends, the app returns to the free plan and existing agents still work.
6. Airplane mode → still Pro (7-day offline grace).

## Browser testing of the paywall UI

The web build can't sell subscriptions; it says so instead. To click through the paywall in a browser while developing:

```bash
EXPO_PUBLIC_BILLING_SANDBOX=1 npx expo start --web
```

**Never** set that variable for a public deployment, because it unlocks Pro for free on the web.

## Paywall rules followed

These are App Store guideline 3.1.2 and Google Play's subscriptions policy, plus our own no-dark-patterns rules:

- Price, period and auto-renewal terms are shown before purchase, and the prices come from the store.
- The buy button says exactly what will be charged ("Subscribe for $4.99 per month").
- No plan is pre-selected. "Save X%" appears only when computed from the real store prices.
- Restore purchases, Manage subscription, Terms (EULA), Privacy and Refund links are always visible.
- The screen can always be closed, and there's no confirm-shaming.
- Privacy features are never paywalled.
