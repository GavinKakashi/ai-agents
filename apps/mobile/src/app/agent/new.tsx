import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AgentForm } from '@/components/agent-form';
import { AppText, Badge, Button, EmptyState, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BLANK_TEMPLATE, TEMPLATES, type AgentTemplate } from '@/lib/templates';
import { useApp } from '@/state/app-store';
import { FREE_AGENT_LIMIT, useSubscription } from '@/state/subscription';

export default function NewAgent() {
  const { createAgent, agents } = useApp();
  const { isPro } = useSubscription();
  const theme = useTheme();
  const [template, setTemplate] = useState<AgentTemplate | null>(null);

  if (!isPro && agents.length >= FREE_AGENT_LIMIT) {
    return (
      <Screen>
        <EmptyState
          icon="people-outline"
          title={`The free plan includes ${FREE_AGENT_LIMIT} agents`}
          body="Your existing agents keep working. Upgrade to Pro to add more."
          action={<Button label="See Pro options" onPress={() => router.replace({ pathname: '/subscribe', params: { reason: 'agents' } })} />}
        />
      </Screen>
    );
  }

  if (!template) {
    return (
      <Screen>
        <AppText variant="heading">Start from a template</AppText>
        <AppText color="textSecondary">You can change everything afterwards.</AppText>
        {[...TEMPLATES, { ...BLANK_TEMPLATE, name: '' }].map((t, idx) => {
          const blank = !t.name;
          const title = blank ? 'Blank agent' : t.name;
          const desc = blank ? 'Start from scratch.' : t.description;
          const locked = !!t.pro && !isPro;
          return (
            <Pressable
              key={idx}
              accessibilityRole="button"
              accessibilityLabel={`${title}. ${desc}${t.pro ? ' Pro template.' : ''}`}
              accessibilityHint={locked ? 'Opens subscription options' : undefined}
              onPress={() => (locked ? router.push('/subscribe') : setTemplate(t))}
              style={({ pressed }) => [styles.tile, { backgroundColor: pressed ? theme.surfaceAlt : theme.surface }]}>
              <View style={styles.tileHeader}>
                <AppText variant="label" style={styles.flex}>{title}</AppText>
                {t.pro ? <Badge label={locked ? 'Pro · locked' : 'Pro'} tone="warning" /> : null}
              </View>
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
  flex: { flex: 1 },
  tileHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tile: { padding: Spacing.md, borderRadius: Radius.lg, gap: 2, minHeight: 64 },
});
