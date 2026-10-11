import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Linking, View } from 'react-native';

import { AppText, Divider, ListRow, Screen, Section, Segmented } from '@/components/ui';
import { BUSINESS } from '@/legal/generated';
import type { ThemePreference } from '@/lib/types';
import { useApp } from '@/state/app-store';
import { useSubscription } from '@/state/subscription';

export default function SettingsScreen() {
  const { hasApiKey, settings, updateSettings } = useApp();
  const { isPro } = useSubscription();

  return (
    <Screen>
      <Section title="Account">
        <ListRow
          icon="key-outline"
          title="Anthropic API key"
          value={hasApiKey ? 'Connected' : 'Not set'}
          onPress={() => router.push('/settings/api-key')}
        />
      </Section>

      <Section title="Subscription">
        <ListRow
          icon="star-outline"
          title={BUSINESS.pricing.proName}
          value={isPro ? 'Active' : 'Free plan'}
          subtitle="Plans, restore purchases, manage or cancel"
          onPress={() => router.push('/subscribe')}
        />
      </Section>

      <Section title="Appearance">
        <View style={{ padding: 16 }}>
          <Segmented<ThemePreference>
            label="Theme"
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </View>
      </Section>

      <Section title="Privacy">
        <ListRow
          icon="shield-checkmark-outline"
          title="Privacy center"
          subtitle="Export or delete your data, manage consent"
          onPress={() => router.push('/settings/privacy')}
        />
      </Section>

      <Section title="Legal">
        <ListRow icon="document-text-outline" title="Terms of Service" onPress={() => router.push('/legal/terms')} />
        <Divider />
        <ListRow icon="lock-closed-outline" title="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
        <Divider />
        <ListRow icon="card-outline" title="Refund Policy" onPress={() => router.push('/legal/refunds')} />
        <Divider />
        <ListRow icon="ellipse-outline" title="Cookie Policy" onPress={() => router.push('/legal/cookies')} />
        <Divider />
        <ListRow icon="accessibility-outline" title="Accessibility Statement" onPress={() => router.push('/legal/accessibility')} />
        <Divider />
        <ListRow icon="code-slash-outline" title="Third-party SDK audit" onPress={() => router.push('/legal/sdk-audit')} />
        <Divider />
        <ListRow icon="library-outline" title="Open-source licences" onPress={() => router.push('/settings/licenses')} />
      </Section>

      <Section title="Support">
        <ListRow icon="business-outline" title="About & business details" onPress={() => router.push('/settings/about')} />
        <Divider />
        <ListRow
          icon="mail-outline"
          title="Contact support"
          subtitle={BUSINESS.supportEmail}
          external
          onPress={() => Linking.openURL(`mailto:${BUSINESS.supportEmail}`)}
        />
      </Section>

      <AppText variant="caption" style={{ textAlign: 'center' }}>
        {BUSINESS.appName} {Constants.expoConfig?.version ?? ''} · {BUSINESS.legalEntityName}
      </AppText>
    </Screen>
  );
}
