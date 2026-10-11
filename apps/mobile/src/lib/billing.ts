// App Store / Google Play subscriptions via expo-iap (StoreKit 2 and Play
// Billing). Payments are handled entirely by Apple and Google; this code never
// sees card details. Entitlement is checked on the device against the store.
//
// Requires a development or production build (not Expo Go) and the products
// configured in App Store Connect and Google Play Console with the IDs in
// business.config.json → pricing.productIds. See docs/SUBSCRIPTIONS.md.
import Constants from 'expo-constants';
import {
  deepLinkToSubscriptions,
  endConnection,
  fetchProducts,
  finishTransaction,
  getActiveSubscriptions,
  initConnection,
  isUserCancelledError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';
import { Platform } from 'react-native';

import {
  ALL_PRODUCT_IDS,
  periodForProduct,
  type BillingAdapter,
  type Entitlement,
  type Plan,
  type PurchaseOutcome,
} from './billing-types';

type Waiter = { productId: string; resolve: (o: PurchaseOutcome) => void; reject: (e: unknown) => void };

function toPlan(p: ProductSubscription): Plan | null {
  const period = periodForProduct(p.id);
  if (!period) return null;
  let offerToken: string | undefined;
  if (p.platform === 'android') {
    // Use the base plan's regular-price offer; we don't run hidden trials or
    // personalised discounts.
    const offers = p.subscriptionOffers ?? [];
    const base = offers.find((o) => o.paymentMode !== 'free-trial') ?? offers[0];
    offerToken = base?.offerTokenAndroid ?? undefined;
  }
  return {
    id: p.id,
    period,
    title: p.title,
    displayPrice: p.displayPrice,
    price: (p as { price?: number | null }).price ?? 0,
    offerToken,
  };
}

class StoreBilling implements BillingAdapter {
  readonly supported = true;
  private subs: { remove: () => void }[] = [];
  private waiter: Waiter | null = null;
  private connected = false;

  async connect() {
    if (this.connected) return;
    await initConnection();
    this.connected = true;
    this.subs.push(
      purchaseUpdatedListener(async (purchase: Purchase) => {
        if (!ALL_PRODUCT_IDS.includes(purchase.productId)) return;
        if (purchase.purchaseState === 'pending') {
          // e.g. "Ask to Buy" or a delayed payment method. Not granted until it completes.
          this.settle(purchase.productId, 'pending');
          return;
        }
        try {
          await finishTransaction({ purchase, isConsumable: false });
        } finally {
          this.settle(purchase.productId, 'purchased');
        }
      }),
      purchaseErrorListener((error) => {
        const w = this.waiter;
        if (!w) return;
        this.waiter = null;
        if (isUserCancelledError(error)) w.resolve('cancelled');
        else w.reject(error);
      })
    );
  }

  private settle(productId: string, outcome: PurchaseOutcome) {
    if (this.waiter && this.waiter.productId === productId) {
      this.waiter.resolve(outcome);
      this.waiter = null;
    }
  }

  async disconnect() {
    this.subs.forEach((s) => s.remove());
    this.subs = [];
    if (this.connected) await endConnection();
    this.connected = false;
  }

  async loadPlans(): Promise<Plan[]> {
    await this.connect();
    const products = (await fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'subs' })) as ProductSubscription[];
    const order = { month: 0, year: 1 };
    return products
      .map(toPlan)
      .filter((p): p is Plan => !!p)
      .sort((a, b) => order[a.period] - order[b.period]);
  }

  async getEntitlement(): Promise<Entitlement> {
    await this.connect();
    const active = (await getActiveSubscriptions(ALL_PRODUCT_IDS)).filter((s) => s.isActive);
    const sub = active[0];
    if (!sub) return { isPro: false };
    return {
      isPro: true,
      productId: sub.productId,
      willRenew: sub.renewalInfoIOS?.willAutoRenew ?? sub.autoRenewingAndroid ?? null,
      expiresAt: sub.expirationDateIOS ?? null,
    };
  }

  async purchase(plan: Plan): Promise<PurchaseOutcome> {
    await this.connect();
    const result = new Promise<PurchaseOutcome>((resolve, reject) => {
      this.waiter = { productId: plan.id, resolve, reject };
    });
    try {
      await requestPurchase({
        type: 'subs',
        request: {
          apple: { sku: plan.id },
          google: {
            skus: [plan.id],
            subscriptionOffers: plan.offerToken ? [{ sku: plan.id, offerToken: plan.offerToken }] : undefined,
          },
        },
      });
    } catch (err) {
      this.waiter = null;
      if (isUserCancelledError(err)) return 'cancelled';
      throw err;
    }
    return result;
  }

  async restore() {
    await this.connect();
    await restorePurchases();
  }

  async manage() {
    await this.connect();
    await deepLinkToSubscriptions(
      Platform.OS === 'android'
        ? { packageNameAndroid: Constants.expoConfig?.android?.package ?? null, skuAndroid: ALL_PRODUCT_IDS[0] }
        : undefined
    );
  }
}

export const billing: BillingAdapter = new StoreBilling();
