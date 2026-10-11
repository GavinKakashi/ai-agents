# Schedule 1: asset inventory

Fill in every row before listing the business. In the agreement, "Transferred Assets" means everything in this schedule.

**Seller:** [SELLER LEGAL NAME] · **Prepared on:** [DATE]

## A. Intellectual property

| # | Asset | Details | How it transfers |
|---|---|---|---|
| A1 | Source code | GitHub repository `[OWNER]/[REPO]` (mobile app, website, server, scripts, docs, legal texts) | GitHub repository transfer, plus a zip archive delivered at closing |
| A2 | App name and brand "Crewdeck" | [Registered trademark number(s), or "unregistered"] | IP Assignment Deed. Trademark office recordal if registered |
| A3 | Logo and app artwork | `apps/mobile/assets/images/*`, original works created for the project | IP Assignment Deed |
| A4 | Legal texts | `legal/*.md` (privacy policy, terms, refund, cookie, accessibility, SDK audit) | IP Assignment Deed. Buyer must adopt them under its own name |
| A5 | Open-source components | Listed in `THIRD_PARTY_NOTICES.md`. **Not owned by seller**; used under their own licences | Not assignable. The buyer continues under the same open-source licences |

## B. Accounts and listings

| # | Asset | Identifier | How it transfers |
|---|---|---|---|
| B1 | iOS app | Bundle ID `[com.yourcompany.crewdeck]`, Apple ID `[APP ID NUMBER]` | App Store Connect "Transfer App" (see 04) |
| B2 | Android app | Package `[com.yourcompany.crewdeck]` | Google Play Console app transfer (see 04) |
| B3 | Subscription products | `[PRODUCT ID MONTHLY]`, `[PRODUCT ID YEARLY]` | Move with the apps (see 05) |
| B4 | Expo / EAS project | `@[expo-account]/crewdeck`, project ID `[ID]` | Expo project transfer to buyer's account (see 04) |
| B5 | Domain | `[yourdomain.com]` at `[REGISTRAR]` | Registrar transfer or account push (see 04) |
| B6 | Website hosting | Replit app `[NAME]` | Transfer ownership or redeploy from the repository (see 04) |
| B7 | Support and privacy mailboxes | `[support@…]`, `[privacy@…]` | Moved with the domain's email service or forwarded during transition |
| B8 | Email delivery provider | `[PROVIDER]` account | New account in buyer's name; seller's account closed after transition |
| B9 | Social media accounts | `[@handles]` | Ownership change per each platform's rules |

## C. Data

| # | Asset | Contents | Notes |
|---|---|---|---|
| C1 | Product-update mailing list | Confirmed subscribers' emails with consent records | Transfers under the privacy policy's "Business transfers" clause. Send the notice in 06 |
| C2 | Privacy-request records | Open and closed requests | Keep for the retention period. Open requests are completed by the buyer |
| C3 | Suppression list | Hashes of unsubscribed addresses | **Must** transfer so unsubscribed people are never emailed again |
| C4 | Sales and analytics history | App Store and Google Play reports up to the transfer date | Exported by seller and delivered as files, because the stores don't move history |

## D. Contracts and goodwill

| # | Item | Details |
|---|---|---|
| D1 | Customer relationships and goodwill | All users and subscribers of the app |
| D2 | Source-code licences previously sold | [List any licensees, or "None"]. These continue; the buyer steps into the seller's position |
| D3 | Supplier contracts | [List, or "None"] |

## E. Excluded assets

- The seller's personal or company developer accounts themselves (only the app moves out of them).
- Cash, receivables and store payouts for sales **before** the transfer date (unless the agreement says otherwise).
- [Anything else the seller keeps]
