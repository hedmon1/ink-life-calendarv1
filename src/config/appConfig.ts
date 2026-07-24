// Product + business configuration. Everything a launch needs to tune lives here.

/** Free trial length — the app locks behind the paywall after this. */
export const TRIAL_DAYS = 14;
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

/** Hosted legal pages — required by App Review. Replace with your hosted URLs. */
export const PRIVACY_URL = 'https://github.com/hedmon1/ink-life-calendar/blob/main/store/PRIVACY_POLICY.md';
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

/** Apple's subscription-management page. */
export const MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
