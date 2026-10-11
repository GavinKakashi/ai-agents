import Constants from 'expo-constants';
import { Linking } from 'react-native';

import { AppText, Card, Divider, ListRow, Screen, Section } from '@/components/ui';
import { BUSINESS } from '@/legal/generated';

export default function About() {
  return (
    <Screen>
      <Card>
        <AppText variant="heading">{BUSINESS.appName}</AppText>
        <AppText color="textSecondary">{BUSINESS.tagline}</AppText>
        <AppText variant="caption">Version {Constants.expoConfig?.version ?? 'unknown'}</AppText>
      </Card>

      <Section title="Business details">
        <ListRow title="Provider" subtitle={BUSINESS.legalEntityName} />
        <Divider />
        <ListRow title="Entity type" subtitle={BUSINESS.entityType} />
        <Divider />
        <ListRow title="Registered address" subtitle={BUSINESS.registeredAddress} />
        <Divider />
        <ListRow title="Company number" subtitle={BUSINESS.companyNumber} />
        <Divider />
        <ListRow title="Tax ID" subtitle={BUSINESS.taxId} />
        <Divider />
        <ListRow title="Support" subtitle={BUSINESS.supportEmail} external onPress={() => Linking.openURL(`mailto:${BUSINESS.supportEmail}`)} />
        <Divider />
        <ListRow title="Privacy" subtitle={BUSINESS.privacyEmail} external onPress={() => Linking.openURL(`mailto:${BUSINESS.privacyEmail}`)} />
        <Divider />
        <ListRow title="Website" subtitle={BUSINESS.websiteUrl} external onPress={() => Linking.openURL(BUSINESS.websiteUrl)} />
      </Section>

      <AppText variant="caption">
        Claude is a trademark of Anthropic, PBC. {BUSINESS.appName} is an independent product and is not affiliated with or endorsed by Anthropic.
      </AppText>
    </Screen>
  );
}
