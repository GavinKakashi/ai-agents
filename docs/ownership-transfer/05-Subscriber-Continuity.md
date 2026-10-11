# Keeping subscribers through the sale

Crewdeck checks Pro access on the device, by asking the App Store or Google Play which subscriptions the user's store account holds. No Crewdeck server or third-party subscription service stands in between. Subscribers keep working through a transfer as long as these stay the same:

| Must not change | Where it's set | Why |
|---|---|---|
| iOS bundle ID and Android package name | `apps/mobile/app.json` | The stores transfer the app *by* these IDs. A new ID would be a new app with no subscribers |
| Subscription product IDs | `business.config.json` → `pricing.productIds` | The app looks up active subscriptions by these IDs |
| Subscription group / base plans | App Store Connect / Play Console | Changing them can split existing subscribers from new ones |

## Before the transfer

1. **Product-ID clash check (Apple):** confirm none of Crewdeck's product IDs already exist in the buyer's account. Apple blocks the transfer if they do. Using IDs prefixed with the bundle ID, as the config does, avoids clashes.
2. **Shared secret (Apple):** generate an app-specific shared secret and give it to the buyer.
3. **Export reports:** subscription and sales reports from both stores up to the transfer date.
4. **Freeze pricing:** don't change subscription prices in the 30 days before the transfer.

## After the transfer

1. The buyer releases an app update signed with their own certificates (iOS) and the same upload key or Play App Signing (Android), with the rebranded legal pages.
2. Test on a device with an existing subscription: open **Settings → Crewdeck Pro**. It should say "Active". If it doesn't, use **Restore purchases**.
3. The buyer regenerates the Apple shared secret.

## Optional: server-side verification

For stronger protection against tampered devices, the buyer can add server-side receipt verification. `expo-iap` supports `verifyPurchase`/`verifyPurchaseWithProvider`. If they do, they must update the Privacy Policy and the SDK audit, because purchase tokens would then reach their server.
