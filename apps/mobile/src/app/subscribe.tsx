import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText, Banner, Button, Card, Screen, textStyles } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BUSINESS } from '@/legal/generated';
import { yearlySavingPercent, type Plan } from '@/lib/billing-types';
import { formatDate } from '@/lib/format';
import { FREE_AGENT_LIMIT, useSubscription } from '@/state/subscription';

const PERIOD_WORD = { month: 'month', year: 'year' } as const;
const STORE = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
const ACCOUNT = Platform.OS === 'ios' ? 'Apple Account' : 'Google account';

/**
 * Paywall. Rules it follows (App Store 3.1.2, Google Play subscriptions
 * policy, and plain fairness):
 * - prices, period and renewal terms come from the store and are shown before purchase;
 * - neither plan is pre-selected to steer the choice, and savings are computed from real prices;
 * - "Restore purchases" and "Manage subscription" are always visible;
 * - closing the screen is always possible and never shamed.
 */
export default function SubscribeScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const theme = useTheme();
  const sub = useSubscription();
  const [selected, setSelected] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'info' | 'danger'; text: string } | null>(null);

  const monthly = sub.plans.find((p) => p.period === 'month');
  const yearly = sub.plans.find((p) => p.period === 'year');
  const saving = yearlySavingPercent(monthly, yearly);

  async function buy() {
    if (!selected) return;
    setBusy(true);
    setMessage(null);
    try {
      const outcome = await sub.purchase(selected);
      if (outcome === 'purchased') setMessage({ tone: 'info', text: `Thank you! ${BUSINESS.pricing.proName} is now active.` });
      else if (outcome === 'pending') setMessage({ tone: 'info', text: 'Your purchase is waiting for approval. Pro will unlock as soon as it completes.' });
    } catch (err) {
      setMessage({ tone: 'danger', text: err instanceof Error ? err.message : 'The purchase could not be completed.' });
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    setMessage(null);
    try {
      const restored = await sub.restore();
      setMessage(
        restored
          ? { tone: 'info', text: 'Your subscription has been restored.' }
          : { tone: 'info', text: `No active subscription was found for this ${ACCOUNT}.` }
      );
    } catch {
      setMessage({ tone: 'danger', text: 'Could not restore purchases. Check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">{BUSINESS.pricing.proName}</AppText>

      {reason === 'agents' && !sub.isPro ? (
        <Banner tone="info">
          <AppText>
            The free plan includes up to {FREE_AGENT_LIMIT} agents. Your existing agents keep working; Pro lets you add more.
          </AppText>
        </Banner>
      ) : null}

      <Card>
        <AppText variant="heading">What Pro adds</AppText>
        <AppText>• Unlimited agents (free plan: {FREE_AGENT_LIMIT})</AppText>
        <AppText>• The Pro template library</AppText>
        <AppText variant="label" style={styles.spaced}>Always free</AppText>
        <AppText color="textSecondary">
          Running and chatting with your agents, all models, usage tracking, and every privacy tool (export, delete, consent).
        </AppText>
        <AppText variant="caption">
          AI usage is billed separately by Anthropic to your own account. The subscription does not include AI usage.
        </AppText>
      </Card>

      {sub.isPro ? (
        <Card>
          <AppText variant="heading">You have Pro</AppText>
          <AppText>
            {sub.entitlement.willRenew === false
              ? 'Your subscription will not renew.'
              : sub.entitlement.willRenew
                ? 'Your subscription renews automatically.'
                : 'Your subscription is active.'}
            {sub.entitlement.expiresAt ? ` Current period ends ${formatDate(new Date(sub.entitlement.expiresAt).toISOString())}.` : ''}
          </AppText>
          <Button kind="secondary" label="Manage or cancel subscription" icon="open-outline" onPress={sub.manage} accessibilityHint={`Opens ${STORE} subscription settings`} />
        </Card>
      ) : !sub.supported ? (
        <Banner tone="warning">
          <AppText>{sub.unsupportedReason}</AppText>
        </Banner>
      ) : (
        <>
          <View style={styles.plans} accessibilityRole="radiogroup" accessibilityLabel="Choose a plan">
            {sub.plans.length === 0 ? (
              <AppText color="textSecondary">{sub.ready ? 'Subscription options are not available right now.' : 'Loading plans…'}</AppText>
            ) : null}
            {sub.plans.map((plan) => {
              const isSel = selected?.id === plan.id;
              const note = plan.period === 'year' && saving ? `Save ${saving}% compared with paying monthly for a year` : undefined;
              return (
                <Pressable
                  key={plan.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSel }}
                  accessibilityLabel={`${plan.displayPrice} per ${PERIOD_WORD[plan.period]}, renews automatically${note ? `. ${note}` : ''}`}
                  onPress={() => setSelected(plan)}
                  style={[
                    styles.plan,
                    { backgroundColor: theme.surface, borderColor: isSel ? theme.primary : theme.border, borderWidth: isSel ? 2 : 1 },
                  ]}>
                  <Text style={[textStyles.label, { color: theme.text }]}>
                    {isSel ? '● ' : '○ '}
                    {plan.period === 'month' ? 'Monthly' : 'Yearly'}
                  </Text>
                  <Text style={[textStyles.heading, { color: theme.text }]}>
                    {plan.displayPrice} / {PERIOD_WORD[plan.period]}
                  </Text>
                  {note ? <Text style={[textStyles.caption, { color: theme.textSecondary }]}>{note}</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <Button
            label={selected ? `Subscribe for ${selected.displayPrice} per ${PERIOD_WORD[selected.period]}` : 'Choose a plan above'}
            disabled={!selected || busy}
            onPress={buy}
          />

          <AppText variant="caption">
            {`Payment is charged to your ${ACCOUNT} when you confirm the purchase. The subscription renews automatically at the same price for the same period unless you cancel at least 24 hours before the current period ends. You can manage or cancel it at any time in your ${STORE} account settings. If you cancel, you keep Pro until the end of the period you have paid for. Prices include any applicable taxes as shown by the ${STORE}.`}
          </AppText>
        </>
      )}

      {message ? (
        <View accessibilityLiveRegion="polite">
          <Banner tone={message.tone}>
            <AppText>{message.text}</AppText>
          </Banner>
        </View>
      ) : null}
      {sub.error && sub.supported ? <AppText variant="caption" color="warning">{sub.error}</AppText> : null}

      {sub.supported ? (
        <View style={styles.row}>
          <Button kind="ghost" label="Restore purchases" onPress={restore} disabled={busy} style={styles.flex} />
          {!sub.isPro ? (
            <Button kind="ghost" label="Manage subscription" onPress={sub.manage} disabled={busy} style={styles.flex} />
          ) : null}
        </View>
      ) : null}

      <View style={styles.links}>
        <Link href="/legal/terms" style={styles.link}>
          <AppText color="primary" style={styles.underline}>Terms of Service (EULA)</AppText>
        </Link>
        <Link href="/legal/privacy" style={styles.link}>
          <AppText color="primary" style={styles.underline}>Privacy Policy</AppText>
        </Link>
        <Link href="/legal/refunds" style={styles.link}>
          <AppText color="primary" style={styles.underline}>Refund Policy</AppText>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  spaced: { marginTop: Spacing.sm },
  plans: { gap: Spacing.sm },
  plan: { borderRadius: Radius.md, padding: Spacing.md, gap: 2, minHeight: 64 },
  row: { flexDirection: 'row', gap: Spacing.sm },
  links: { gap: Spacing.xs },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: Spacing.sm },
  underline: { textDecorationLine: 'underline' },
});
