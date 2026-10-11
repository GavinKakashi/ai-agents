import { Stack, useLocalSearchParams } from 'expo-router';

import { LegalDocument } from '@/components/legal-doc';
import { AppText, EmptyState, Screen } from '@/components/ui';
import { LEGAL_DOCS } from '@/legal/generated';

export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doc = LEGAL_DOCS[slug];

  if (!doc) {
    return (
      <Screen>
        <EmptyState icon="document-outline" title="Document not found" body="This document is not available." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: doc.title }} />
      <AppText variant="title">{doc.title}</AppText>
      <LegalDocument blocks={doc.blocks} />
    </Screen>
  );
}
