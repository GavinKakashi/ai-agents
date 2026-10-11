import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Banner, Button, Card, Checkbox, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { BUSINESS } from '@/legal/generated';
import { useApp } from '@/state/app-store';

/**
 * First-run consent. Both boxes start unticked, and the button stays disabled
 * until the user actively ticks them. No pre-ticked boxes, no bundled
 * marketing consent, no "accept to continue" tricks.
 */
export default function Welcome() {
  const { acceptPolicies, consent } = useApp();
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const policyUpdated = !!consent && consent.policyVersion !== BUSINESS.policyVersion;

  async function accept() {
    await acceptPolicies();
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <Screen>
        <View style={styles.hero}>
          <AppText variant="title">Welcome to {BUSINESS.appName}</AppText>
          <AppText color="textSecondary">{BUSINESS.tagline}</AppText>
        </View>

        {policyUpdated ? (
          <Banner tone="warning">
            <AppText variant="label">Our terms have changed</AppText>
            <AppText>Please review the updated Terms of Service and Privacy Policy (version {BUSINESS.policyVersion}).</AppText>
          </Banner>
        ) : null}

        <Card>
          <AppText variant="heading">How it works</AppText>
          <AppText>• Create agents with their own instructions and Claude model.</AppText>
          <AppText>• Connect your own Anthropic API key. Anthropic bills you directly for usage.</AppText>
          <AppText>• Your agents and conversations are stored only on this device. No account, no analytics, no ads.</AppText>
        </Card>

        <Card>
          <AppText variant="heading">Price</AppText>
          <AppText>{BUSINESS.pricing.summary}</AppText>
        </Card>

        <View style={styles.links}>
          <Link href="/legal/terms" style={styles.link}>
            <AppText color="primary" style={styles.underline}>Read the Terms of Service</AppText>
          </Link>
          <Link href="/legal/privacy" style={styles.link}>
            <AppText color="primary" style={styles.underline}>Read the Privacy Policy</AppText>
          </Link>
        </View>

        <Checkbox checked={age} onChange={setAge} label={`I am ${BUSINESS.minimumAge} or older`}>
          <AppText>I am {BUSINESS.minimumAge} or older.</AppText>
        </Checkbox>
        <Checkbox
          checked={terms}
          onChange={setTerms}
          label="I agree to the Terms of Service and have read the Privacy Policy">
          <AppText>I agree to the Terms of Service and have read the Privacy Policy.</AppText>
        </Checkbox>

        <Button
          label="Continue"
          onPress={accept}
          disabled={!age || !terms}
          accessibilityHint={!age || !terms ? 'Tick both boxes above to continue' : undefined}
        />
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { gap: Spacing.sm, marginTop: Spacing.lg },
  links: { gap: Spacing.sm },
  link: { minHeight: 44, justifyContent: 'center', paddingVertical: Spacing.sm },
  underline: { textDecorationLine: 'underline' },
});
