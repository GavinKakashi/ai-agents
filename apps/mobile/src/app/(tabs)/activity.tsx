import { router } from 'expo-router';
import { View } from 'react-native';

import { Divider, EmptyState, ListRow, Screen, Section } from '@/components/ui';
import { formatDateTime, formatTokens } from '@/lib/format';
import { useApp } from '@/state/app-store';

export default function ActivityScreen() {
  const { conversations, agents } = useApp();
  const sorted = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (sorted.length === 0) {
    return (
      <Screen>
        <EmptyState icon="pulse-outline" title="No activity yet" body="Conversations with your agents will appear here." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Section title="Recent conversations">
        {sorted.map((c, idx) => {
          const agent = agents.find((a) => a.id === c.agentId);
          const tokens = c.messages.reduce(
            (sum, m) => (m.role === 'assistant' ? sum + m.usage.inputTokens + m.usage.outputTokens : sum),
            0
          );
          const failed = c.messages.some((m) => m.role === 'user' && m.status === 'failed');
          return (
            <View key={c.id}>
              {idx > 0 ? <Divider /> : null}
              <ListRow
                icon={failed ? 'alert-circle' : 'chatbubbles-outline'}
                title={c.title}
                subtitle={`${agent?.name ?? 'Deleted agent'} · ${formatDateTime(c.updatedAt)} · ${formatTokens(tokens)} tokens${failed ? ' · Has a failed message' : ''}`}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })}
              />
            </View>
          );
        })}
      </Section>
    </Screen>
  );
}
