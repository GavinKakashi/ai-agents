# Account transfer guide

Work through these steps in order. Store transfers come last, because they are hardest to undo. Tick each one on the Closing Handover Certificate.

Store and platform rules change. Before starting each step, re-check the provider's current help page.

## 1. Source code (GitHub)

1. Seller: make sure the repository is **private**.
2. Seller: **Settings → General → Danger Zone → Transfer ownership** to the buyer's GitHub account or organisation. Alternatively, the buyer creates a new private repo and the seller pushes all branches to it.
3. Both: confirm the buyer can clone it and that `npm run check` passes.
4. Seller: also hand over a zip archive of the final commit, as a backup.

## 2. Domain

1. Seller: unlock the domain and obtain the transfer (EPP/auth) code from the registrar.
2. Buyer: start the transfer at their registrar, or ask the seller's registrar to "push" the domain to the buyer's account there.
3. Keep DNS records identical during the move: website, email MX, SPF/DKIM/DMARC.

## 3. Website and privacy-request service (Replit)

Pick one option:

- **Redeploy (simplest):** the buyer imports the transferred GitHub repository into their own Replit account, presses Run, then Deploy, and points the domain at it. Then move the data as described in step 5.
- **Transfer:** if Replit offers ownership transfer for the app at the time, use it. Otherwise redeploy.

## 4. Email

1. Mailboxes (`support@`, `privacy@`): move them with the domain's email service, or set forwarding to the buyer during the transition period.
2. Email delivery provider: the buyer opens their own account, verifies the domain and sets `SMTP_URL`, then signs that provider's data processing agreement. The seller closes their account after the transition.

## 5. Data (mailing list, privacy requests, suppression list)

1. Seller: copy the server's data file. That is `apps/server/data/db.json` locally, or the `crewdeck_db` key in Replit Database.
2. Deliver it to the buyer through an encrypted channel.
3. Buyer: load it into the new deployment.
4. The suppression list **must** come across, so unsubscribed people are never emailed.
5. Send the mailing-list notice in `06-Customer-Notices.md`.

## 6. Expo / EAS

1. Buyer: create an Expo account or organisation.
2. Seller: transfer the project to the buyer's account from the Expo dashboard (project settings). If that isn't available, the buyer runs `npx eas-cli@latest init` with the same `slug` and the seller removes the old project.
3. Signing credentials: keep the **same Android upload key**, or use Play App Signing key upgrade rules. Export it with `eas credentials` and hand it over securely. iOS certificates are re-created under the buyer's Apple account.

## 7. Apple App Store

Apple's app-transfer criteria (App Store Connect Help → Transfer an app) include:

- Both accounts accept the latest Paid and Free agreements and are not in a pending or changing state.
- The app has at least one released version and is not in review or pending release.
- TestFlight builds and testers are removed, and Xcode Cloud data is removed.
- In-App Purchase product IDs on the app must not match any product ID already in the buyer's account.
- Apps with auto-renewable subscriptions must use an **app-specific shared secret**. Generate it and give it to the buyer before the transfer, and the buyer generates a new one afterwards.

Steps:

1. Seller (Account Holder): App Store Connect → the app → App Information → **Transfer App**, then enter the buyer's Apple Team ID and Account Holder Apple ID.
2. Buyer (Account Holder): accept within the time limit Apple shows.
3. After transfer: the bundle ID, ratings and reviews stay with the app. The buyer receives sales and payment data only for transactions after the transfer.

## 8. Google Play

1. Both accounts must be active, verified developer accounts in good standing.
2. Seller: in Play Console, use the **app transfer** option, or Play Console Help → contact support → "Transfer apps". Provide the package name and the buyer's account details. Google may ask for proof of the sale.
3. The package name, users, ratings and reviews move with the app. Download the seller's financial reports first, because they don't move.
4. Buyer: set up their payments profile so subscription payouts go to them, and create their own Google Cloud service account if they add server-side purchase checks.

Google's process has changed over time. Confirm it in Play Console Help before starting.

## 9. Rebrand to the new owner

Buyer:

```bash
cp docs/ownership-transfer/new-owner.example.json docs/ownership-transfer/new-owner.json
# fill it in
npm run transfer -- docs/ownership-transfer/new-owner.json
npm run check && npm run check:business
```

Then publish the website, and ship an app update that carries the new legal pages. The app will ask every user to review the updated terms.

## 10. Rotate secrets

After closing, the buyer changes every password, API token, SMTP credential and shared secret the seller ever had access to.
