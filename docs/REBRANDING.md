# Rebranding guide (for source-code buyers)

Everything brand- and business-specific lives in a few files.

0. **Bought the whole business?** Run `npm run transfer -- <new-owner.json>` (see `docs/ownership-transfer/`). It does step 1 for you and keeps app and subscription IDs unchanged.
1. **Business and legal details:** `business.config.json` (name, tagline, company details, emails, price wording, policy version). Then run `npm run build:legal` — it regenerates the in-app policies (`apps/mobile/src/legal/generated.ts`) and the website (`apps/web/public`).
2. **App identity:** `apps/mobile/app.json` → `name`, `slug`, `scheme`, `ios.bundleIdentifier`, `android.package`, splash and adaptive-icon background colours.
3. **Artwork:** replace the PNGs in `apps/mobile/assets/images/` (1024 × 1024 icon; adaptive-icon foreground must fit the central 66%). The website reuses `icon.png`.
4. **Colours:** `apps/mobile/src/constants/theme.ts` and the matching variables in `apps/web/src/styles.css`. Run `npm run check:contrast` — it fails if any pair drops below WCAG AA.
5. **Models and prices:** `apps/mobile/src/lib/models.ts`. Update the prices and `PRICES_AS_OF` together.
6. **Subscriptions:** plan names, free limit and product IDs in `business.config.json` → `pricing`. A licensee launching a *new* app must use their own new product IDs and bundle IDs. See `docs/SUBSCRIPTIONS.md`.
7. **Agent templates:** `apps/mobile/src/lib/templates.ts`.
8. **Legal text:** edit `legal/*.md`. Bump `policyVersion` in `business.config.json` for material changes; the app will then ask every user to re-accept.
9. **Licence notices:** after changing dependencies, run `npm run notices` and update `legal/third-party-sdk-audit.md`.

Finally run `npm run check` (contrast, tests, typecheck, lint) and `npm run check:business`.
