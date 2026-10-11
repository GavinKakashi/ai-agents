---
title: Privacy Policy
slug: privacy
---

# Privacy Policy

**Effective date:** {{effectiveDate}} · **Version:** {{policyVersion}}

This policy explains what personal data {{appName}} ("we", "us") handles, why, and the choices you have. We wrote it to match what the software actually does. If anything here is unclear, email {{privacyEmail}}.

## Who we are

{{appName}} is provided by {{legalEntityName}} ({{entityType}}), {{registeredAddress}}. Company number: {{companyNumber}}. We are the data controller for the limited data described in the "Website and privacy-request service" section below.

- Privacy contact: {{privacyEmail}}
- EU representative: {{euRepresentative}}
- UK representative: {{ukRepresentative}}

## The short version

- The {{appName}} mobile app has **no account, no analytics, no advertising, no crash reporting and no tracking**.
- Your agents, conversations and settings are stored **only on your device**.
- Your Anthropic API key is stored in your device's secure storage (iOS Keychain / Android Keystore). On the web version it is kept in memory only and is forgotten when you close the tab.
- When you send a message to an agent, the app sends it **directly from your device to Anthropic**. It does not pass through our servers, and we cannot see it.
- We do not sell or share personal data, and we do not use it for advertising.

## Data the mobile app handles

| Data | Where it is stored | Who can access it | Why |
|---|---|---|---|
| Agent configurations (name, instructions, model, settings) | Your device only | You | To run your agents |
| Conversations with your agents, including token counts | Your device only | You | To show your history |
| Your Anthropic API key | Device secure storage (web: memory only) | You | To call the Anthropic API on your behalf |
| Consent record (which policy versions you accepted, and when) | Your device only | You | To show what you agreed to |
| App preferences (e.g. light or dark theme) | Your device only | You | To remember your choices |

We never receive any of this data. Because it is stored only on your device, uninstalling the app or using **Settings → Privacy center → Delete all data** removes it permanently. We cannot recover it for you.

### Messages you send to AI agents

When you run an agent, the app sends the agent's instructions, the conversation, and your API key to Anthropic's API (`api.anthropic.com`) over an encrypted connection. Anthropic processes this data under **your own agreement with Anthropic**, including their privacy policy and usage policies. We are not a party to that processing. Please do not include sensitive personal data about other people in your messages unless you have a lawful basis to do so.

### What the app does not do

The app does not collect your name, email, phone number, contacts, location, photos, device identifiers or advertising identifiers. It contains no third-party analytics, advertising or tracking SDKs. A full list of the third-party software it contains, and what each part does, is in our Third-party SDK audit.

## Website and privacy-request service

Our website ({{websiteUrl}}) and its small backend handle the following, only if you choose to use them:

| Data | Purpose | Legal basis (UK/EU GDPR) | Retention |
|---|---|---|---|
| Privacy request: your email address, the type of request, the details you provide | To respond to your request and keep a record that we did | Legal obligation (Art. 6(1)(c)) | 24 months after the request is closed, then deleted |
| Product-update emails: your email address, the date and wording of your consent, confirmation status | To send product updates you asked for | Consent (Art. 6(1)(a)), which you can withdraw at any time | Until you unsubscribe. On unsubscribe, the address is deleted; we keep a one-way hash only so we do not email you again by mistake |

We do not log IP addresses in our application. To prevent abuse, we keep request counts in memory for up to one hour, keyed by a salted hash of the IP address; nothing is written to disk. Our hosting provider may keep standard security logs under its own policies.

Every product-update email contains a one-click unsubscribe link. We send product-update emails only after you confirm your address by clicking a link we email you (double opt-in).

## Cookies and similar technologies

The website does not set cookies by default. It stores your cookie-consent choice in your browser's local storage. Optional categories (such as analytics) are off unless you turn them on. See the Cookie Policy for details.

## Service providers

We use the following providers to run the website and privacy-request service. They process data only on our instructions:

- Hosting: {{hostingProvider}}
- Email delivery: {{emailProvider}}

## International transfers

Our providers may process data outside your country. Where UK or EU personal data is transferred to a country without an adequacy decision, we rely on the European Commission's Standard Contractual Clauses (and the UK Addendum) or an equivalent safeguard.

## Your rights

Depending on where you live (for example under the UK GDPR, EU GDPR, or US state laws such as the California Consumer Privacy Act), you may have the right to:

- access the personal data we hold about you;
- correct it;
- delete it;
- restrict or object to processing;
- receive it in a portable format;
- withdraw consent at any time, without affecting earlier processing;
- not be discriminated against for exercising these rights;
- complain to a data protection authority (in the UK, the ICO; in the EU, your local supervisory authority).

**How to make a request:** use the privacy request form at {{websiteUrl}}/privacy-request.html, or email {{privacyEmail}}. We will respond within one month (45 days for California residents), and will tell you if we need more time. We may need to confirm your identity first. You can use an authorised agent.

**Data in the app:** we do not hold it, so we cannot access, export or delete it for you. You control it directly: **Settings → Privacy center** lets you export everything as a file or delete it all.

We do not sell or "share" personal information (as those terms are defined in the CCPA), and we do not process sensitive personal information for inferring characteristics.

## Children

{{appName}} is not intended for anyone under {{minimumAge}}. We do not knowingly collect personal data from children. If you believe a child has sent us personal data, contact {{privacyEmail}} and we will delete it.

## Security

API keys are kept in the operating system's secure storage. All network traffic uses HTTPS. The privacy-request service stores only the minimum data listed above. No system is perfectly secure; if we become aware of a breach that affects you, we will notify you and the relevant authorities where required by law.

## Changes to this policy

If we make a material change, we will update the version and effective date above, and the app will ask you to review the new version before you continue. Earlier versions are available on request.

## Contact

{{legalEntityName}}, {{registeredAddress}} · {{privacyEmail}}
