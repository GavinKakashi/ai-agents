# Selling Crewdeck: ownership transfer pack

This folder is everything needed to sell Crewdeck as a business, so the buyer ends up owning and running the app, its subscribers, its code, its brand and its accounts.

> These are templates and checklists, not legal advice. Each party should have its own lawyer review the agreement before signing, especially for tax, consumer-law and data-protection points in your countries.

## What's in this pack

| File | What it is | When you use it |
|---|---|---|
| [01-Asset-Inventory.md](01-Asset-Inventory.md) | List of everything being sold (code, brand, accounts, data, subscribers), with where each lives and how it moves | Before listing the app for sale; becomes Schedule 1 of the agreement |
| [02-Asset-Purchase-Agreement.md](02-Asset-Purchase-Agreement.md) | The sale contract for the whole business | At signing |
| [03-IP-Assignment-Deed.md](03-IP-Assignment-Deed.md) | Short deed that formally assigns copyright, trademarks and other IP | Signed at closing |
| [04-Account-Transfer-Guide.md](04-Account-Transfer-Guide.md) | Step-by-step moves for Apple, Google Play, Expo, GitHub, domain, Replit, email | During handover |
| [05-Subscriber-Continuity.md](05-Subscriber-Continuity.md) | How to keep existing subscribers' Pro access and billing working through the transfer | Before and during the store transfers |
| [06-Customer-Notices.md](06-Customer-Notices.md) | Ready-to-send notices to users and email subscribers | Around closing |
| [07-Seller-Disclosure-Schedule.md](07-Seller-Disclosure-Schedule.md) | The seller's honest statements about the business (revenue, issues, licences) | Due diligence; attached to the agreement |
| [08-Closing-Handover-Certificate.md](08-Closing-Handover-Certificate.md) | Checklist both parties sign to confirm everything moved | Closing day |
| [new-owner.example.json](new-owner.example.json) | The buyer's details, used by the rebranding script | After closing |

## How the sale runs

1. **Prepare (seller).** Fill in `01-Asset-Inventory.md` and `07-Seller-Disclosure-Schedule.md`. Export the App Store and Google Play sales and payout reports, because the buyer only receives data from the transfer date onwards. Make the GitHub repository **private**.
2. **Agree terms.** Fill in the bracketed fields in `02-Asset-Purchase-Agreement.md`: price, escrow, transition support, non-compete.
3. **Sign and fund escrow.** The buyer pays into an escrow service, not directly to the seller.
4. **Transfer the assets** in the order set out in `04-Account-Transfer-Guide.md`. The app store transfers go last, after the code, domain and website.
5. **Rebrand to the new owner (buyer).** Copy `new-owner.example.json`, fill it in, and run:
   ```bash
   npm run transfer -- docs/ownership-transfer/new-owner.json
   ```
   This writes the buyer's business details into every policy, the website footer, the app's About screen, emails and `LICENSE`. It also bumps the policy version, so every user is asked to review the updated terms.
6. **Notify customers** using `06-Customer-Notices.md`.
7. **Close.** Both parties sign `08-Closing-Handover-Certificate.md` and `03-IP-Assignment-Deed.md`, and escrow releases the funds.
8. **Transition period.** The seller provides the agreed support. Any keys and secrets the seller had access to are rotated.

## What does not need transferring

- **User data in the app.** It lives only on users' devices. Nothing to migrate.
- **Anthropic accounts.** Each user brings their own API key. The business has no AI bill to move.
- **Payment processors.** Apple and Google collect subscription payments, and their payouts follow the developer account that owns the app after transfer.
