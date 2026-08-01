# Ink — App Store launch checklist

**v1 ships free, with no accounts and no in-app purchases.** That removes most of
what App Review usually scrutinises: no paywall, no login, no account deletion
requirement, no Paid Applications agreement, no data collection to declare.

Items marked **(you)** need your Apple/EAS accounts — no one else can do them.
Code-side items are done and marked ✅.

---

## 1. What you need

| Account | Where | Why |
|---|---|---|
| Apple Developer Program ($99/yr) | developer.apple.com | required to ship at all |
| Expo / EAS | expo.dev | cloud builds & submit |

No Firebase, no RevenueCat, no banking/tax forms — a free app only needs the free
Apple Developer Agreement, which is already accepted when you join.

## 2. Host the two required pages (you)

`../ink-landing/privacy.html` and `../ink-landing/support.html` are written and
match the landing site. **inkcalendar.ink is already live on Netlify** — redeploy
the `ink-landing` folder to that same site (dashboard → Deploys → drag the folder
in, or `npx netlify-cli deploy --prod --dir=.` from `ink-landing`), then confirm:

- Privacy policy → `https://inkcalendar.ink/privacy.html`
- Support → `https://inkcalendar.ink/support.html`

Note: a drag-and-drop deploy replaces the whole site, so the local `index.html`
(which is ahead of what's live) goes up too — check you're happy with it first.

Both URLs are wired into the app's About screen via `SITE` in
`src/config/appConfig.ts`. ✅

## 3. Create the app record (you — App Store Connect)

1. App Store Connect → My Apps → **＋ New App**
   - Platform iOS · Name **Ink** · Primary language English
   - Bundle ID **com.ink.lifecalendar** (register it under Certificates,
     Identifiers & Profiles first if it isn't in the dropdown)
   - SKU: anything unique, e.g. `ink-life-calendar`
2. Pricing and Availability → **Free**, all territories.
3. App Information:
   - Category: **Lifestyle** (secondary: Productivity)
   - Age rating questionnaire → all "None" → results in **4+**
   - Privacy Policy URL → your `/privacy.html`
4. Also register the App Group `group.com.ink.lifecalendar` under Identifiers if
   EAS hasn't already created it (it usually does on the first build).

## 4. App Privacy questionnaire (you)

Ink collects nothing, so this is the short path:

> **Do you or your third-party partners collect data from this app?** → **No**

That yields a "Data Not Collected" privacy label. This is accurate: no analytics,
no ads, no accounts, no network calls of any kind — photos and entries never leave
the device. ✅

## 5. Store listing (you)

- **Screenshots** — required: **6.9"** (iPhone 17 Pro Max / 16 Pro Max, 1320×2868).
  6.5" is optional now; Apple scales the 6.9" set down. Take them in the simulator
  (`⌘S` saves to Desktop) or from your own phone. Good five: the grid, This Week,
  a locked memory with a photo, Goals, the widget on a Home Screen.
- **Description** — say plainly that it's free, offline and account-free; that's a
  selling point. Mention the home/lock-screen widgets.
- **Keywords** — life calendar, weeks, memento mori, life in weeks, journal, habit,
  time, mortality, planner.
- **Support URL** → your `/support.html` · **Marketing URL** → the landing page.
- **Promotional text** can be changed without a new build; the description can't.

## 6. Build & submit

```bash
cd ink-app
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Then in App Store Connect: the build appears under TestFlight in ~10–20 minutes
(after processing). Test it yourself via TestFlight first, then attach that build
to the **1.0 version** page and hit **Add for Review** → **Submit**.

Answer "Does this app use encryption?" → **No** (`usesNonExemptEncryption: false`
is already set in app.json ✅).

## 7. Review-guideline status

| Guideline | Requirement | Status |
|---|---|---|
| 2.1 | App completeness, reviewer can use everything | ✅ free, no login — reviewer just opens it |
| 2.3.10 | Accurate metadata | **(you)** screenshots + description |
| 5.1.1 | Don't force signup | ✅ there is no signup |
| 5.1.1(v) | In-app account deletion | **N/A** — no accounts exist |
| 5.1.2 | Privacy policy URL | **(you)** host it (§2), paste URL in §3 |
| 3.1.1 | IAP for digital unlocks | **N/A** — nothing is sold |
| 4.8 | Sign in with Apple | **N/A** — no third-party login |
| 4.2 | Minimum functionality | ✅ journal + grid + goals + widgets |
| — | Export compliance | ✅ `usesNonExemptEncryption: false` |
| — | App icon | ✅ `assets/icon.png` 1024×1024 — replace with a nicer one any time |
| — | Push notifications | ✅ local only, no APNs key needed |
| — | Photo permission strings | ✅ `NSPhotoLibraryUsageDescription` in app.json |

## 8. App Review notes (paste into App Store Connect)

> Ink is a life calendar: your life drawn as 4,160 weekly squares, with a weekly
> check-in you can attach a sentence, a rating and photos to. The app is free,
> requires no account and works fully offline — no login is needed to review it.
> To see the widgets: add "Ink — Life in Weeks" from the widget gallery (large size
> for the Home Screen, rectangular for the Lock Screen).

## 9. Dormant code (not shipped)

Accounts, cloud backup and the $4.99 subscription were built earlier and still
exist in the repo, but nothing mounts them any more: `store/auth.tsx`,
`components/CloudSync.tsx`, `screens/AuthScreen.tsx`, `screens/PaywallScreen.tsx`,
`lib/firebase.ts`, `lib/purchases.ts`. Metro doesn't bundle unreferenced modules,
so none of it ships. To bring it back: re-wrap `<AuthProvider>` + `<CloudSync/>` in
App.tsx and restore the gates in `RootNavigator`. Turning it on later means a new
App Store Connect subscription product, the Paid Apps agreement and a fuller
privacy label.

## 10. After approval

- Updates: bump nothing by hand — `eas.json` has `autoIncrement`; just build,
  submit, and add release notes on a new version page.
- Phased release (7-day ramp) is a toggle on the version page; useful for a first
  launch so a bad bug doesn't hit everyone at once.
