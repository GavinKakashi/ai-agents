import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { BUSINESS } from '@/legal/generated';
import { billing } from '@/lib/billing';
import type { Entitlement, Plan, PurchaseOutcome } from '@/lib/billing-types';

const CACHE_KEY = 'crewdeck:v1:entitlement';
/** If the store can't be reached (e.g. offline), a recent Pro check is trusted for this long. */
const OFFLINE_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export const FREE_AGENT_LIMIT: number = BUSINESS.pricing.freeAgentLimit;

type SubscriptionState = {
  supported: boolean;
  unsupportedReason?: string;
  ready: boolean;
  isPro: boolean;
  entitlement: Entitlement;
  plans: Plan[];
  /** Plain-language problem loading plans or status, if any. */
  error?: string;
  refresh: () => Promise<void>;
  purchase: (plan: Plan) => Promise<PurchaseOutcome>;
  restore: () => Promise<boolean>;
  manage: () => Promise<void>;
};

const Ctx = createContext<SubscriptionState | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entitlement, setEntitlement] = useState<Entitlement>({ isPro: false });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!billing.supported) {
      setReady(true);
      return;
    }
    try {
      const ent = await billing.getEntitlement();
      setEntitlement(ent);
      setError(undefined);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ...ent, checkedAt: Date.now() }));
    } catch {
      // Store unreachable: fall back to a recent successful check.
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const cached = raw ? (JSON.parse(raw) as Entitlement & { checkedAt: number }) : null;
      if (cached?.isPro && Date.now() - cached.checkedAt < OFFLINE_GRACE_MS) setEntitlement(cached);
      setError("Couldn't reach the store to check your subscription. We'll try again shortly.");
    }
    try {
      setPlans(await billing.loadPlans());
    } catch {
      setError("Couldn't load subscription options from the store. Check your connection and try again.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // Deferred so the first check runs after mount, not during the effect.
    const first = setTimeout(refresh, 0);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      clearTimeout(first);
      sub.remove();
    };
  }, [refresh]);

  const value = useMemo<SubscriptionState>(
    () => ({
      supported: billing.supported,
      unsupportedReason: billing.unsupportedReason,
      ready,
      isPro: entitlement.isPro,
      entitlement,
      plans,
      error,
      refresh,
      async purchase(plan) {
        const outcome = await billing.purchase(plan);
        if (outcome === 'purchased') await refresh();
        return outcome;
      },
      async restore() {
        await billing.restore();
        await refresh();
        return (await billing.getEntitlement()).isPro;
      },
      async manage() {
        await billing.manage();
        await refresh();
      },
    }),
    [ready, entitlement, plans, error, refresh]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription(): SubscriptionState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}
