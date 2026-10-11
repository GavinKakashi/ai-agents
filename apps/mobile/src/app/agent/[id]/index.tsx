import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card, Divider, EmptyState, ListRow, Screen, Section } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { confirmAction } from '@/lib/confirm';
import { formatDate, formatDateTime } from '@/lib/format';
import { getModel } from '@/lib/models';
import { useApp } from '@/state/app-store';
import { FREE_AGENT_LIMIT, useSubscription } from '@/state/subscription';

export default function AgentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { agents, conversations, updateAgent, duplicateAgent, deleteAgent, startConversation } = useApp();
  const { isPro } = useSubscription();
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return (
      <Screen>
        <EmptyState icon="help-circle-outline" title="Agent not found" body="It may have been deleted." />
      </Screen>
    );
  }

  const agentConversations = conversations
    .filter((c) => c.agentId === agent.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const paused = agent.status === 'paused';

  async function onDelete() {
    const ok = await confirmAction(
      `Delete “${agent!.name}”?`,
      `This permanently deletes the agent and its ${agentConversations.length} conversation(s) from this device. This can't be undone.`,
      'Delete'
    );
    if (!ok) return;
    await deleteAgent(agent!.id);
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: agent.name }} />
      <View style={styles.header}>
        <Avatar name={agent.name} colorIndex={agent.colorIndex} size={64} />
        <View style={styles.flex}>
          <AppText variant="heading">{agent.name}</AppText>
          {agent.description ? <AppText color="textSecondary">{agent.description}</AppText> : null}
          <Badge label={paused ? 'Paused' : 'Active'} tone={paused ? 'warning' : 'success'} />
        </View>
      </View>

      <Button
        label="New conversation"
        icon="chatbubble-ellipses-outline"
        disabled={paused}
        accessibilityHint={paused ? 'Resume the agent to start a conversation' : undefined}
        onPress={async () => {
          const c = await startConversation(agent.id);
          router.push({ pathname: '/chat/[id]', params: { id: c.id } });
        }}
      />

      <Card>
        <AppText variant="label">Configuration</AppText>
        <AppText>Model: {getModel(agent.model)?.label ?? agent.model}</AppText>
        <AppText>Effort: {agent.effort}</AppText>
        <AppText>Maximum reply: {agent.maxTokens.toLocaleString()} tokens</AppText>
        <AppText variant="label" style={{ marginTop: Spacing.sm }}>Instructions</AppText>
        <AppText color="textSecondary" numberOfLines={6}>{agent.systemPrompt || 'None'}</AppText>
        <AppText variant="caption">Created {formatDate(agent.createdAt)} · Updated {formatDate(agent.updatedAt)}</AppText>
      </Card>

      <View style={styles.actions}>
        <Button
          kind="secondary"
          label="Edit"
          icon="create-outline"
          style={styles.flex}
          onPress={() => router.push({ pathname: '/agent/[id]/edit', params: { id: agent.id } })}
        />
        <Button
          kind="secondary"
          label={paused ? 'Resume' : 'Pause'}
          icon={paused ? 'play-outline' : 'pause-outline'}
          style={styles.flex}
          onPress={() => updateAgent(agent.id, { status: paused ? 'active' : 'paused' })}
        />
      </View>
      <View style={styles.actions}>
        <Button
          kind="secondary"
          label="Duplicate"
          icon="copy-outline"
          style={styles.flex}
          onPress={async () => {
            if (!isPro && agents.length >= FREE_AGENT_LIMIT) {
              router.push({ pathname: '/subscribe', params: { reason: 'agents' } });
              return;
            }
            const copy = await duplicateAgent(agent.id);
            if (copy) router.replace({ pathname: '/agent/[id]', params: { id: copy.id } });
          }}
        />
        <Button kind="danger" label="Delete" icon="trash-outline" style={styles.flex} onPress={onDelete} />
      </View>

      {agentConversations.length ? (
        <Section title="Conversations">
          {agentConversations.map((c, idx) => (
            <View key={c.id}>
              {idx > 0 ? <Divider /> : null}
              <ListRow
                title={c.title}
                subtitle={`${formatDateTime(c.updatedAt)} · ${c.messages.length} messages`}
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: c.id } })}
              />
            </View>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: Spacing.xs },
  header: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
});
