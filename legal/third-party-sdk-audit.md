---
title: Third-party SDK audit
slug: sdk-audit
---

# Third-party SDK audit

**Last reviewed:** {{effectiveDate}}

This is every third-party software package that {{appName}} ships with directly, what it does, whether it collects data, and what it connects to. It is reviewed on every release. Transitive dependencies, and the licence of every package, are listed in **Settings → Open-source licences**.

## Result

- **Analytics, advertising, attribution or tracking SDKs:** none.
- **Crash reporting or session recording SDKs:** none.
- **Social login or social sharing SDKs:** none.
- **Network connections made by the app:** only to `api.anthropic.com`, and only when you verify your API key or run an agent.

## Mobile app — direct dependencies

| Package | Purpose | Collects personal data? | Network access |
|---|---|---|---|
| @anthropic-ai/sdk (Anthropic) | Sends your messages to Claude using your API key | No; sends only what you submit, to Anthropic | `api.anthropic.com`, only when you act |
| expo, expo-router, expo-constants, expo-linking, expo-font, expo-splash-screen, expo-status-bar, expo-system-ui (Expo) | App framework, navigation, app version, opening links, splash screen | No | None at runtime |
| expo-secure-store (Expo) | Stores your API key in the iOS Keychain / Android Keystore | No | None |
| @react-native-async-storage/async-storage | Stores agents, conversations and settings on your device | No | None |
| @expo/vector-icons | Icons (Ionicons, MIT licence), bundled in the app | No | None |
| react, react-native, react-dom, react-native-web (Meta) | User interface framework | No | None |
| react-native-gesture-handler, react-native-reanimated, react-native-worklets, react-native-screens, react-native-safe-area-context | Gestures, animation and native screen containers | No | None |

## Website and privacy-request service

| Component | Purpose | Collects personal data? | Network access |
|---|---|---|---|
| Node.js standard library only | Web server, forms, storage | Only what you submit in a form | None beyond serving the site |
| nodemailer (optional, only if the operator configures SMTP) | Sends confirmation and privacy-request emails | Your email address, to deliver the email | The operator's email provider |
| Cookie consent manager (our own code) | Records your cookie choice | No | None |

The website loads no fonts, scripts or images from third-party servers.

## Developer tooling (not shipped to users)

Expo's command-line tools may send anonymous usage data to Expo while a developer builds the app. Set `EXPO_NO_TELEMETRY=1` to turn this off. This does not affect the app you install.

## How we keep this accurate

- `npm run notices` regenerates the licence list and fails the build if a package has a licence we have not reviewed.
- Any new dependency must be added to this page, with its purpose and data behaviour, before release.
