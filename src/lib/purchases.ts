import { Platform } from 'react-native';
import { RC_ENTITLEMENT, REVENUECAT_IOS_KEY } from '../config/appConfig';

// RevenueCat wrapper. Everything degrades gracefully when the native module or
// the API key is missing (web preview, Expo Go, pre-launch dev builds).

function rc(): any | null {
  if (Platform.OS !== 'ios') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-purchases').default;
  } catch {
    return null;
  }
}

export function purchasesAvailable(): boolean {
  return !!REVENUECAT_IOS_KEY && !!rc();
}

let configured = false;

export async function initPurchases(): Promise<void> {
  if (!purchasesAvailable() || configured) return;
  try {
    rc()!.configure({ apiKey: REVENUECAT_IOS_KEY });
    configured = true;
  } catch {
    // best-effort
  }
}

export async function hasActiveSubscription(): Promise<boolean> {
  if (!purchasesAvailable()) return false;
  try {
    await initPurchases();
    const info = await rc()!.getCustomerInfo();
    return !!info?.entitlements?.active?.[RC_ENTITLEMENT];
  } catch {
    return false;
  }
}

/** Live localized price string for the monthly package, if the store has loaded. */
export async function monthlyPriceLabel(): Promise<string | null> {
  if (!purchasesAvailable()) return null;
  try {
    await initPurchases();
    const offerings = await rc()!.getOfferings();
    return offerings?.current?.monthly?.product?.priceString ?? null;
  } catch {
    return null;
  }
}

/** Start the monthly purchase. Returns whether the entitlement is now active. */
export async function purchaseMonthly(): Promise<boolean> {
  if (!purchasesAvailable()) throw new Error('unavailable');
  await initPurchases();
  const offerings = await rc()!.getOfferings();
  const pkg = offerings?.current?.monthly ?? offerings?.current?.availablePackages?.[0];
  if (!pkg) throw new Error('no-offering');
  const { customerInfo } = await rc()!.purchasePackage(pkg);
  return !!customerInfo?.entitlements?.active?.[RC_ENTITLEMENT];
}

export async function restorePurchases(): Promise<boolean> {
  if (!purchasesAvailable()) return false;
  await initPurchases();
  const info = await rc()!.restorePurchases();
  return !!info?.entitlements?.active?.[RC_ENTITLEMENT];
}
