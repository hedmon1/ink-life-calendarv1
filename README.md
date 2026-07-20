# Ink — Life Calendar & Countdown (iOS)

A fully functional Expo / React Native app built from the **Ink** landing page. The
UI is modeled on the landing's **section 05 · "The App"** — the iPhone screens — and
every concept from the marketing site is implemented as real, persistent behavior.

> _"You have ~2,000 weeks left. Probably fewer."_ Each box is one week of ≈90 years
> (**4,680** weeks). **Ink** = weeks lived (permanent). **Pencil** = weeks ahead (changeable).

No accounts, no backend, no secrets — all state lives on-device via AsyncStorage.

## Screens

Bottom tabs: **Week · Grid · Goals · Memories**, plus full-screen sheets for the
weekly check-in, a week's detail, the window explainers, and the tutorial.

| Screen | What it does |
|--------|--------------|
| **This Week** | The daily anchor: live week number (`1,461 of 4,680`), the **Prime** and **Proximity** windows (each with a progress bar + tap-to-explain), the active goal with a progress strip, and a prominent **check-in** button. |
| **The Grid** | All 4,680 weeks on one screen. **Prime** shows by default, **Proximity** is off until toggled. Pinch-free zoom (1×–4×, always opens at 1×). Tap any inked week to reopen its photo + sentence. The week you installed Ink is marked **black with a green outline**. |
| **Goals** | Draft a goal: a name + a week-count stepper. Penciled, active (dark card) and finished goals each show the **week range they run**, so you can find those weeks in Memories. Goals never clutter the grid. |
| **Check-in** | A focused full-screen review: up to **three** photos, one sentence, a fulfillment rating, and an irreversible **Lock in Ink**. Your *first* check-in is available immediately and sets your weekly check-in weekday; after that it unlocks only on that day. |
| **Memories** | Every photographed week in order — a featured card plus a gallery, with **search by week number or word**. Tap any to reopen it (date range, stars, sentence, goal tag). |

## Concept → implementation

- **Two layers (ink / pencil)** — `src/lib/calc.ts`, `src/components/LifeGrid.tsx`
- **Prime window (closes ~age 35)** — `PRIME_END = 35 × 52`; `primeLeft = max(0, primeEnd − lived)`
- **Proximity window (capped 86 wks)** — `proxLeft = min(86, left)`
- **Goals** — name + weeks; phases derive from the current week (`penciled → active → finished`); each remembers its week range
- **Weekly check-in** — sentence + rating + up to 3 photos; no edits, no deletions; the first one fixes your check-in weekday (`src/lib/checkin.ts`)
- **Tutorial** — a brief, replayable walkthrough with live mini-previews of each screen
- **Persistence** — everything is stored locally (`AsyncStorage`, key `ink.state.v5`). A fresh install is seeded with demo content so the app looks alive on first run.

## Run it on iOS (dev mode)

```bash
cd ink-app
npm install
npx expo start            # dev server (Metro)
# press  i  to open the iOS Simulator, or scan the QR with Expo Go
```

Managed Expo workflow (SDK 54), Expo-Go compatible. Kept in **dev mode** — no
production build, no EAS submit.

## Stack

Expo SDK 54 · React 19 · React Native 0.81 · React Navigation v7 (bottom tabs +
native-stack) · AsyncStorage · expo-image-picker · expo-haptics · react-native-svg ·
Google Fonts (Newsreader + IBM Plex Mono).
