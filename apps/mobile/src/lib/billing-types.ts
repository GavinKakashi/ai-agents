import { BUSINESS } from '@/legal/generated';

export type PlanPeriod = 'month' | 'year';

/** A subscription plan as reported by the store, with the store's localised price. */
export type Plan = {
  id: string;
  period: PlanPeriod;
  title: string;
  /** Localised price string from the store, e.g. "$4.99" or "4,99 €". Always show this, never a hard-coded price. */
  displayPrice: string;
  /** Numeric price in the store currency, used only to compute an honest yearly saving. */
  price: number;
  /** Google Play offer token for the base plan. */
  offerToken?: string;
};

export type Entitlement = {
  isPro: boolean;
  productId?: string;
  /** null when the store doesn't say. */
  willRenew?: boolean | null;
  /** Milliseconds since epoch, when known (iOS). */
  expiresAt?: number | null;
};

export type PurchaseOutcome = 'purchased' | 'pending' | 'cancelled';

export interface BillingAdapter {
  /** False when the platform can't sell subscriptions (e.g. the web build). */
  readonly supported: boolean;
  readonly unsupportedReason?: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  loadPlans(): Promise<Plan[]>;
  getEntitlement(): Promise<Entitlement>;
  purchase(plan: Plan): Promise<PurchaseOutcome>;
  restore(): Promise<void>;
  /** Opens the store's own subscription management screen (cancel, change plan). */
  manage(): Promise<void>;
}

export const PRODUCT_IDS: Record<PlanPeriod, string> = {
  month: BUSINESS.pricing.productIds.monthly,
  year: BUSINESS.pricing.productIds.yearly,
};

export const ALL_PRODUCT_IDS = [PRODUCT_IDS.month, PRODUCT_IDS.year];

export function periodForProduct(id: string): PlanPeriod | undefined {
  if (id === PRODUCT_IDS.month) return 'month';
  if (id === PRODUCT_IDS.year) return 'year';
  return undefined;
}

/**
 * Yearly saving versus paying monthly for 12 months, computed from the real
 * store prices. Returns null unless both prices are known, in the same
 * currency, and the saving is real. Never shows an invented discount.
 */
export function yearlySavingPercent(monthly?: Plan, yearly?: Plan): number | null {
  if (!monthly || !yearly || monthly.price <= 0 || yearly.price <= 0) return null;
  const pct = Math.floor((1 - yearly.price / (monthly.price * 12)) * 100);
  return pct >= 1 ? pct : null;
}
