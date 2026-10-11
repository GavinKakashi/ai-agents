# App Store and Google Play submission notes

## Build

```bash
cd apps/mobile
npx eas-cli@latest build --platform all     # cloud builds, no Xcode/Android Studio needed
npx eas-cli@latest submit --platform ios    # or android
```

Set your own `ios.bundleIdentifier` and `android.package` in `app.json` first.

## Required URLs

| Field | URL (once the website is deployed) |
|---|---|
| Privacy policy | `https://<your-domain>/privacy.html` |
| Terms / EULA | `https://<your-domain>/terms.html` |
| Support | `https://<your-domain>/` or your support email |

## Apple privacy label and Google Data safety

What the app does, for you to map onto the current questionnaires:

- The developer collects **no data** from the app: no account, analytics, crash reporting, advertising or tracking. `app.json` declares `NSPrivacyTracking: false` and no collected data types in the iOS privacy manifest.
- At the user's direction, the app sends the user's messages and agent instructions **directly to Anthropic** using the user's own API key. The developer never receives this data.
- Encryption: all traffic uses HTTPS (standard, exempt encryption; `usesNonExemptEncryption: false`).

**Judgement call:** both stores define "collection" and "sharing" in their own ways, and they change their guidance over time. Whether user-directed transfers to the user's own AI provider must be declared (for example as "User content → Other user content" under App functionality) is something you should check against the current Apple and Google definitions when you submit. If in doubt, declare it: over-disclosure is safer than under-disclosure.

## Review notes for Apple

Reviewers need an Anthropic API key to test agent replies. Provide a key with a low spending limit in the App Review notes, and revoke it after review.

## Age rating

The app passes user-written prompts to a general-purpose AI model. Answer the age-rating questionnaire accordingly; the Terms set a minimum age of 18 (configurable in `business.config.json`).
