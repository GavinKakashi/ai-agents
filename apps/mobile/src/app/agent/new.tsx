import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AgentForm } from '@/components/agent-form';
import { AppText, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLANK_TEMPLATE, TEMPLATES, type AgentTemplate } from '@/lib/templates';
import { useApp } from '@/state/app-store';

export default function NewAgent() {
  const { createAgent } = useApp();
  const theme = useTheme();
  const [template, setTemplate] = useState<AgentTemplate | null>(null);

  if (!template) {
    return (
      <Screen>
        <AppText variant="heading">Start from a template</AppText>
        <AppText color="textSecondary">You can change everything afterwards.</AppText>
        {[...TEMPLATES, { ...BLANK_TEMPLATE, name: '' }].map((t, idx) => {
          const blank = !t.name;
          const title = blank ? 'Blank agent' : t.name;
          const desc = blank ? 'Start from scratch.' : t.description;
          return (
            <Pressable
              key={idx}
              accessibilityRole="button"
              accessibilityLabel={`${title}. ${desc}`}
              onPress={() => setTemplate(t)}
              style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? theme.surfaceAlt : theme.surface }]}>
              <AppText variant="label">{title}</AppText>
              <AppText variant="caption">{desc}</AppText>
            </Pressable>
          );
        })}
      </Screen>
    );
  }

  return (
    <Screen>
      <AgentForm
        initial={template}
        submitLabel="Create agent"
        onSubmit={async (values) => {
          const agent = await createAgent(values);
          router.replace({ pathname: '/agent/[id]', params: { id: agent.id } });
        }}
      />
      <View />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tile: { padding: Spacing.md, borderRadius: Radius.lg, gap: 2, minHeight: 64 },
});
