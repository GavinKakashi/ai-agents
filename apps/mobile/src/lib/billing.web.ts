// The web build can't sell App Store / Google Play subscriptions, so Pro is
// unavailable there. For testing the paywall in a browser only, build with
// EXPO_PUBLIC_BILLING_SANDBOX=1 to use a simulated store. Never set that flag
// for a public deployment: it lets anyone unlock Pro for free.
import { PRODUCT_IDS, type BillingAdapter, type Entitlement, type Plan, type PurchaseOutcome } from './billing-types';

const SANDBOX = process.env.EXPO_PUBLIC_BILLING_SANDBOX === '1';

class UnsupportedBilling implements BillingAdapter {
  readonly supported = false;
  readonly unsupportedReason = 'Subscriptions are sold through the iPhone and Android apps.';
  async connect() {}
  async disconnect() {}
  async loadPlans(): Promise<Plan[]> {
    return [];
  }
  async getEntitlement(): Promise<Entitlement> {
    return { isPro: false };
  }
  async purchase(): Promise<PurchaseOutcome> {
    throw new Error(this.unsupportedReason);
  }
  async restore() {}
  async manage() {}
}

class SandboxBilling implements BillingAdapter {
  readonly supported = true;
  private active: string | null = null;
  async connect() {}
  async disconnect() {}
  async loadPlans(): Promise<Plan[]> {
    return [
      { id: PRODUCT_IDS.month, period: 'month', title: 'Pro Monthly (sandbox)', displayPrice: '$4.99', price: 4.99 },
      { id: PRODUCT_IDS.year, period: 'year', title: 'Pro Yearly (sandbox)', displayPrice: '$39.99', price: 39.99 },
    ];
  }
  async getEntitlement(): Promise<Entitlement> {
    return this.active ? { isPro: true, productId: this.active, willRenew: true, expiresAt: null } : { isPro: false };
  }
  async purchase(plan: Plan): Promise<PurchaseOutcome> {
    this.active = plan.id;
    return 'purchased';
  }
  async restore() {}
  async manage() {
    // Simulates cancelling in the store.
    this.active = null;
  }
}

export const billing: BillingAdapter = SANDBOX ? new SandboxBilling() : new UnsupportedBilling();
