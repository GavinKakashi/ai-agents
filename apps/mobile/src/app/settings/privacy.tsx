import { router } from 'expo-router';
import { Linking, Platform, Share, View } from 'react-native';

import { AppText, Card, Divider, ListRow, Screen, Section } from '@/components/ui';
import { BUSINESS } from '@/legal/generated';
import { confirmAction, notify } from '@/lib/confirm';
import { formatDateTime } from '@/lib/format';
import { useApp } from '@/state/app-store';

export default function PrivacyCenter() {
  const { agents, conversations, consent, exportData, deleteAllData, withdrawConsent } = useApp();

  async function onExport() {
    const json = exportData();
    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `crewdeck-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    await Share.share({ message: json, title: `${BUSINESS.appName} data export` });
  }

  async function onDeleteAll() {
    const ok = await confirmAction(
      'Delete all data?',
      `This permanently deletes ${agents.length} agent(s), ${conversations.length} conversation(s), your settings, consent record and API key from this device. This can't be undone.`,
      'Delete everything'
    );
    if (!ok) return;
    await deleteAllData();
    notify('Deleted', 'All your data has been removed from this device.');
    router.replace('/welcome');
  }

  async function onWithdraw() {
    const ok = await confirmAction(
      'Withdraw consent?',
      "You'll need to accept the Terms again to keep using the app. Your agents and conversations stay on this device unless you also delete them.",
      'Withdraw',
      false
    );
    if (!ok) return;
    await withdrawConsent();
    router.replace('/welcome');
  }

  return (
    <Screen>
      <Card>
        <AppText variant="heading">{"What's stored, and where"}</AppText>
        <AppText>Everything below is stored only on this device. We never receive it.</AppText>
        <AppText>• {agents.length} agent(s)</AppText>
        <AppText>• {conversations.length} conversation(s)</AppText>
        <AppText>• Your settings and API key (the key is in secure storage)</AppText>
        <AppText>• Your consent record</AppText>
        <AppText variant="caption">No analytics, advertising, tracking or crash-reporting tools are included in this app.</AppText>
      </Card>

      <Section title="Your data">
        <ListRow icon="download-outline" title="Export my data" subtitle="Save a copy as a JSON file (excludes your API key)" onPress={onExport} />
        <Divider />
        <ListRow icon="trash-outline" title="Delete all data" subtitle="Remove everything from this device" danger onPress={onDeleteAll} />
      </Section>

      <Section
        title="Consent"
        footer={consent ? `You accepted policy version ${consent.policyVersion} on ${formatDateTime(consent.acceptedAt)}.` : undefined}>
        <ListRow icon="hand-left-outline" title="Withdraw consent" onPress={onWithdraw} />
      </Section>

      <Section title="Data we hold" footer="We only hold data you send through our website, such as product-update subscriptions or earlier privacy requests.">
        <ListRow
          icon="mail-unread-outline"
          title="Make a privacy request"
          subtitle="Access, correction, deletion, portability, objection"
          external
          onPress={() => Linking.openURL(`${BUSINESS.websiteUrl}/privacy-request.html`)}
        />
        <Divider />
        <ListRow
          icon="at-outline"
          title="Email our privacy contact"
          subtitle={BUSINESS.privacyEmail}
          external
          onPress={() => Linking.openURL(`mailto:${BUSINESS.privacyEmail}?subject=Privacy%20request`)}
        />
      </Section>

      <View>
        <ListRow icon="lock-closed-outline" title="Read the Privacy Policy" onPress={() => router.push('/legal/privacy')} />
      </View>
    </Screen>
  );
}
