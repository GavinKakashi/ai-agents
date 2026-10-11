import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Banner, Button, Card, EmptyState, Field, Screen } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatCost, formatTokens } from '@/lib/format';
import { estimateCost, getModel } from '@/lib/models';
import { useApp } from '@/state/app-store';

export default function AgentsScreen() {
  const { agents, conversations, hasApiKey } = useApp();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const totals = useMemo(() => {
    let tokens = 0;
    let cost = 0;
    let costKnown = true;
    for (const c of conversations)
      for (const m of c.messages)
        if (m.role === 'assistant') {
          tokens += m.usage.inputTokens + m.usage.outputTokens;
          const est = estimateCost(m.usage);
          if (est === null) costKnown = false;
          else cost += est;
        }
    return { tokens, cost: costKnown ? cost : null };
  }, [conversations]);

  const filtered = agents.filter((a) =>
    `${a.name} ${a.description}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Screen>
      {!hasApiKey ? (
        <Banner tone="warning">
          <AppText variant="label">Connect your Anthropic account</AppText>
          <AppText>Add your API key so your agents can run. It is stored securely on this device.</AppText>
          <Button label="Add API key" kind="secondary" onPress={() => router.push('/settings/api-key')} />
        </Banner>
      ) : null}

      <View style={styles.stats}>
        <Stat label="Agents" value={String(agents.length)} />
        <Stat label="Conversations" value={String(conversations.length)} />
        <Stat label="Tokens used" value={formatTokens(totals.tokens)} />
        <Stat label="Est. cost" value={formatCost(totals.cost)} />
      </View>

      <Button label="New agent" icon="add" onPress={() => router.push('/agent/new')} />

      {agents.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No agents yet"
          body="Create your first agent from a template or from scratch."
        />
      ) : (
        <>
          {agents.length > 4 ? (
            <Field label="Search agents" value={query} onChangeText={setQuery} autoCorrect={false} />
          ) : null}
          <View style={styles.list}>
            {filtered.map((agent) => {
              const count = conversations.filter((c) => c.agentId === agent.id).length;
              const model = getModel(agent.model)?.label ?? agent.model;
              return (
                <Pressable
                  key={agent.id}
                  onPress={() => router.push({ pathname: '/agent/[id]', params: { id: agent.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${agent.name}. ${agent.status === 'paused' ? 'Paused. ' : ''}${model}. ${count} conversations.`}
                  accessibilityHint="Opens the agent"
                  style={({ pressed }) => [
                    styles.agentCard,
                    { backgroundColor: pressed ? theme.surfaceAlt : theme.surface },
                  ]}>
                  <Avatar name={agent.name} colorIndex={agent.colorIndex} />
                  <View style={styles.flex}>
                    <AppText variant="label">{agent.name}</AppText>
                    {agent.description ? (
                      <AppText variant="caption" numberOfLines={2}>
                        {agent.description}
                      </AppText>
                    ) : null}
                    <AppText variant="caption">
                      {model} · {count} {count === 1 ? 'conversation' : 'conversations'}
                    </AppText>
                  </View>
                  {agent.status === 'paused' ? <Badge label="Paused" tone="warning" /> : <Badge label="Active" tone="success" />}
                </Pressable>
              );
            })}
            {filtered.length === 0 ? <AppText color="textSecondary">No agents match “{query}”.</AppText> : null}
          </View>
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <View accessible accessibilityLabel={`${label}: ${value}`}>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="heading">{value}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  stat: { flexGrow: 1, flexBasis: '45%', padding: Spacing.md },
  list: { gap: Spacing.sm },
  agentCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, minHeight: 72 },
});
