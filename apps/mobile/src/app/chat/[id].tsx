import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppText, Banner, Button, EmptyState, textStyles } from '@/components/ui';
import { MaxContentWidth, MinTouch, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatCost, formatTokens } from '@/lib/format';
import { estimateCost } from '@/lib/models';
import type { ChatMessage } from '@/lib/types';
import { useApp } from '@/state/app-store';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, agents, sendMessage, pending, deleteConversation, hasApiKey } = useApp();
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const conversation = conversations.find((c) => c.id === id);
  const agent = conversation && agents.find((a) => a.id === conversation.agentId);
  const busy = !!(conversation && pending[conversation.id]);
  const count = conversation?.messages.length ?? 0;

  useEffect(() => {
    if (count) setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
  }, [count]);

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
        <EmptyState icon="chatbubbles-outline" title="Conversation not found" body="It may have been deleted." />
      </SafeAreaView>
    );
  }

  const paused = agent?.status === 'paused';
  const canSend = !!draft.trim() && !busy && !!agent && !paused && hasApiKey;

  async function send() {
    if (!canSend) return;
    const text = draft.trim();
    setDraft('');
    await sendMessage(conversation!.id, text);
  }

  async function remove() {
    const ok = await confirmAction('Delete this conversation?', "It will be removed from this device. This can't be undone.", 'Delete');
    if (!ok) return;
    await deleteConversation(conversation!.id);
    router.back();
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: agent?.name ?? 'Conversation',
          headerRight: () => (
            <Pressable
              onPress={remove}
              accessibilityRole="button"
              accessibilityLabel="Delete conversation"
              hitSlop={8}
              style={styles.headerButton}>
              <Ionicons name="trash-outline" size={22} color={theme.danger} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.notices}>
              {!agent ? (
                <Banner tone="danger">
                  <AppText>The agent for this conversation was deleted. You can read it but not continue it.</AppText>
                </Banner>
              ) : null}
              {paused ? (
                <Banner tone="warning">
                  <AppText>This agent is paused. Resume it to continue.</AppText>
                </Banner>
              ) : null}
              {!hasApiKey ? (
                <Banner tone="warning">
                  <AppText>Add your Anthropic API key to send messages.</AppText>
                  <Button label="Add API key" kind="secondary" onPress={() => router.push('/settings/api-key')} />
                </Banner>
              ) : null}
              {conversation.messages.length === 0 && agent ? (
                <AppText color="textSecondary" style={styles.center}>
                  Send a message to start. Messages go directly from this device to Anthropic.
                </AppText>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onRetry={
                item.role === 'user' && item.status === 'failed' && agent && !paused
                  ? () => sendMessage(conversation.id, item.text, item.id)
                  : undefined
              }
            />
          )}
          ListFooterComponent={
            busy ? (
              <View style={styles.thinking} accessibilityLiveRegion="polite" accessible accessibilityLabel={`${agent?.name ?? 'Agent'} is responding`}>
                <ActivityIndicator color={theme.primary} />
                <AppText color="textSecondary">{agent?.name ?? 'Agent'} is responding…</AppText>
              </View>
            ) : null
          }
        />

        <View style={[styles.composer, { borderTopColor: theme.surfaceAlt, backgroundColor: theme.background }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={agent ? `Message ${agent.name}` : 'Unavailable'}
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel={agent ? `Message ${agent.name}` : 'Message'}
            editable={!!agent && !paused}
            multiline
            maxLength={50000}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            onKeyPress={(e) => {
              // On the web, Enter sends and Shift+Enter adds a new line.
              const ne = e.nativeEvent as unknown as { key: string; shiftKey?: boolean };
              if (Platform.OS === 'web' && ne.key === 'Enter' && !ne.shiftKey) {
                (e as unknown as { preventDefault: () => void }).preventDefault();
                send();
              }
            }}
          />
          <Pressable
            onPress={send}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !canSend, busy }}
            style={[styles.send, { backgroundColor: theme.primary, opacity: canSend ? 1 : 0.5 }]}>
            <Ionicons name="arrow-up" size={22} color={theme.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message, onRetry }: { message: ChatMessage; onRetry?: () => void }) {
  const theme = useTheme();
  const mine = message.role === 'user';

  if (mine) {
    const failed = message.status === 'failed';
    return (
      <View style={[styles.row, styles.rowEnd]}>
        <View
          style={[styles.bubble, { backgroundColor: theme.primary }]}
          accessible
          accessibilityLabel={`You said: ${message.text}${failed ? '. Not sent.' : ''}`}>
          <Text selectable style={[textStyles.body, { color: theme.onPrimary }]}>{message.text}</Text>
        </View>
        {failed ? (
          <View style={styles.failed}>
            <AppText color="danger" variant="caption" accessibilityLiveRegion="polite">
              Not sent: {message.error}
            </AppText>
            {onRetry ? <Button label="Retry" kind="ghost" icon="refresh" onPress={onRetry} /> : null}
          </View>
        ) : null}
      </View>
    );
  }

  const cost = estimateCost(message.usage);
  return (
    <View style={styles.row}>
      <View style={[styles.bubble, styles.assistant, { backgroundColor: theme.surface }]}>
        <Text selectable style={[textStyles.body, { color: theme.text }]}>
          {message.text || '(No text in this reply.)'}
        </Text>
      </View>
      {message.notice ? <AppText variant="caption" color="warning">{message.notice}</AppText> : null}
      <AppText variant="caption">
        {formatTokens(message.usage.inputTokens)} in · {formatTokens(message.usage.outputTokens)} out · est. {formatCost(cost)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  list: { padding: Spacing.md, gap: Spacing.md, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  notices: { gap: Spacing.sm },
  row: { gap: Spacing.xs, alignItems: 'flex-start' },
  rowEnd: { alignItems: 'flex-end' },
  bubble: { padding: Spacing.md, borderRadius: Radius.lg, maxWidth: '90%' },
  assistant: { maxWidth: '100%' },
  failed: { alignItems: 'flex-end' },
  thinking: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', padding: Spacing.md },
  composer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.sm, borderTopWidth: 1, alignItems: 'flex-end' },
  input: { flex: 1, minHeight: MinTouch, maxHeight: 160, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 16 },
  send: { width: MinTouch, height: MinTouch, borderRadius: MinTouch / 2, alignItems: 'center', justifyContent: 'center' },
  headerButton: { minWidth: MinTouch, minHeight: MinTouch, alignItems: 'center', justifyContent: 'center' },
});
