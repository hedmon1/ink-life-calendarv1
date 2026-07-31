# Ink — App Store / TestFlight launch checklist

Everything between you and an approved build. Items marked **(you)** need your accounts —
no one else can do them. Code-side items are already done and noted as ✅.

---

## 1. Accounts you need (you)

| Account | Where | Why |
|---|---|---|
| Apple Developer Program ($99/yr) | developer.apple.com | TestFlight + App Store |
| Expo / EAS | expo.dev | cloud builds & submit |
| Firebase project | console.firebase.google.com | accounts + cloud backup |
| RevenueCat (free tier) | app.revenuecat.com | subscription handling |

## 2. Fill in the config (5 minutes once accounts exist)

1. **Firebase** → project settings → add a *Web* app → copy the config into
   `src/config/firebase.config.ts` (replaces the `TODO`s). Enable **Authentication →
   Email/Password** and **Cloud Firestore**, then paste these security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
2. **RevenueCat** → add iOS app (bundle `com.ink.lifecalendar`) → copy the public
   iOS SDK key (`appl_…`) into `REVENUECAT_IOS_KEY` in `src/config/appConfig.ts`.
3. **Apple Team ID** → App Store Connect → Membership → put it in `app.json` under
   `expo.ios.appleTeamId` (the widget/App Group signing needs it).
4. **Founder window** → set `FOUNDER_DEADLINE_MS` in `src/config/appConfig.ts` to
   30 days after your real launch day (currently 2026-08-23).
5. Register the **App Group** `group.com.ink.lifecalendar` under Certificates,
   Identifiers & Profiles → Identifiers (EAS can also do this for you on first build).

## 3. The subscription product (you — App Store Connect)

1. App Store Connect → My Apps → **＋ New App** (bundle `com.ink.lifecalendar`).
2. Monetization → Subscriptions → create group “Ink Pro” → add auto-renewable
   subscription **`ink_pro_monthly`**, 1 month, **$4.99**.
3. Sign the **Paid Applications agreement** + banking/tax (Agreements, Tax, Banking).
4. RevenueCat → Products: import `ink_pro_monthly`; Entitlements: create **`pro`**
   and attach the product; Offerings: make a `default` offering with it as the
   monthly package. (The app looks for entitlement `pro` — already wired. ✅)
5. Subscriptions must also be attached to the app version in App Store Connect the
   first time you submit.

## 4. Build & TestFlight

```bash
cd ink-app
npx eas-cli login          # (you)
npx eas-cli build:configure   # links the project, writes projectId into app.json
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```
- TestFlight → add yourself as internal tester.
- The `development` profile needs `npx expo install expo-dev-client` first (only if
  you want a dev-client build; not needed for TestFlight).

## 5. Review-guideline compliance — status

| Guideline | Requirement | Status |
|---|---|---|
| 3.1.1 | Digital unlock must use Apple IAP | ✅ RevenueCat / StoreKit only — no outside payments |
| 3.1.2 | Paywall shows price, term, auto-renew language, Privacy + Terms links | ✅ PaywallScreen |
| 3.1.2 | Restore Purchases button | ✅ Paywall + Account |
| 5.1.1(v) | In-app **account deletion** that removes server data | ✅ Account → Delete Account (re-auth → Firestore wipe → auth delete) |
| 5.1.1 | Don’t force signup before the app is usable | ✅ onboarding runs first; account gate only after (and only when Firebase is configured) |
| 4.8 | Sign in with Apple | **Not required** — only email/password is offered (no third-party login). If you ever add Google login, Apple login becomes mandatory. |
| 5.1.2 | Privacy policy URL | ⚠️ **(you)** host `store/PRIVACY_POLICY.md` somewhere public (GitHub works) and put the URL in App Store Connect **and** `PRIVACY_URL` in appConfig.ts |
| — | Terms (EULA) | ✅ uses Apple’s standard EULA link |
| 2.1 | App completeness / reviewer access | **(you)** in App Review notes: provide a demo login (create one yourself: e.g. review@yourdomain + password). The one-month trial also means a fresh reviewer install has full access. |
| 2.3.10 | Accurate metadata | **(you)** screenshots (6.9" + 6.5"), description, keywords. Mention the founding-member offer in the description if you keep it. |
| 5.1.1 | App Privacy questionnaire | **(you)** declare: **Email address** (account), **User content** (photos/journal — stored on device; text backed up to your servers), **Purchases**. No tracking, no ads → “Data not used to track you.” |
| — | Export compliance | ✅ `usesNonExemptEncryption: false` already in app.json |
| — | App icon | ✅ `assets/icon.png` (1024×1024, generated) — replace anytime with a nicer one |
| — | Push notifications | ✅ local notifications only — no APNs key needed |

## 6. How the membership logic works (already built ✅)

- **Founding members**: accounts created on/before `FOUNDER_DEADLINE_MS` get
  `founder: true` on their Firestore profile → app is free for life, no paywall ever.
- **Everyone after**: one-month trial from the first app open (`installedAt`, with the
  account's server-side `createdAt` as a backstop so reinstalls can't reset it), then the app
  locks behind the Paywall until `pro` (via RevenueCat) is active.
- **No Firebase config** → local dev mode: no gate, no trial (what you have today).

Small print worth knowing:
- The trial clock is the earlier of the local `installedAt` (synced to the cloud
  backup) and the profile's server-side `createdAt` — so deleting and reinstalling
  the app does **not** reset it once an account exists.
- Photos are stored on-device; account backup covers text/goals/settings (photo
  binaries are not uploaded in v1 — say so in your privacy policy, already drafted).

## 7. Suggested App Review notes (paste into App Store Connect)

> Ink is a life-calendar journal. New users get full access for one month, after
> which the Ink Pro subscription ($4.99/month, auto-renewable) is required.
> Demo account: <email> / <password>. Widgets require adding “Ink — Life in Weeks”
> from the widget gallery.
