// Product + business configuration. Everything a launch needs to tune lives here.
//
// v1 ships FREE with no accounts: the auth/paywall screens (AuthScreen,
// PaywallScreen, store/auth.tsx, CloudSync) are no longer mounted anywhere, and
// the trial/subscription values below are dormant. They're kept so the feature
// can be switched back on later without rewriting it.

/**
 * Free trial length — one month, counted from the FIRST APP OPEN (not account
 * creation). The app locks behind the paywall after this.
 */
export const TRIAL_DAYS = 30;
export const TRIAL_MS = TRIAL_DAYS * 86400000;

/**
 * Founding-member window: accounts created on or before this date get a free
 * lifetime membership (stored on their profile at signup — no purchase needed).
 * Set this to 30 days after your public launch day.
 */
export const FOUNDER_DEADLINE_MS = Date.parse('2026-08-23T23:59:59');
export const FOUNDER_DEADLINE_LABEL = 'AUG 23';

/** Shown until the live App Store price loads from the store. */
export const PRICE_LABEL = '$4.99 / month';

/**
 * RevenueCat public iOS SDK key (starts with "appl_"). Purchases stay disabled
 * until this is set — see store/APP_STORE_CHECKLIST.md.
 */
export const REVENUECAT_IOS_KEY = '';

/** RevenueCat entitlement identifier that unlocks the app. */
export const RC_ENTITLEMENT = 'pro';

/**
 * Hosted pages — App Review requires a reachable privacy policy and support URL.
 * These live in ../ink-landing; swap the host if you move to a custom domain.
 */
const SITE = 'https://inkcalendar.ink';
export const PRIVACY_URL = `${SITE}/privacy.html`;
export const SUPPORT_URL = `${SITE}/support.html`;
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

/** Apple's subscription-management page. */
export const MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
