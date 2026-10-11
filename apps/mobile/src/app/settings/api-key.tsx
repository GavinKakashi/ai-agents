import { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppText, Banner, Button, Card, Field, Screen } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { describeError, verifyApiKey } from '@/lib/anthropic';
import { confirmAction } from '@/lib/confirm';
import { deleteApiKey, getApiKey, isPersistentKeyStorage, maskKey, setApiKey } from '@/lib/secrets';
import { useApp } from '@/state/app-store';

export default function ApiKeyScreen() {
  const { refreshApiKeyStatus } = useApp();
  const [current, setCurrent] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<{ tone: 'info' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getApiKey().then(setCurrent);
  }, []);

  async function save() {
    const key = input.trim();
    if (!key) return;
    setBusy(true);
    setStatus(null);
    try {
      await verifyApiKey(key);
      await setApiKey(key);
      setCurrent(key);
      setInput('');
      setStatus({ tone: 'info', text: 'Key verified and saved.' });
      await refreshApiKeyStatus();
    } catch (err) {
      setStatus({ tone: 'danger', text: describeError(err) });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const ok = await confirmAction('Remove API key?', 'Your agents will not be able to run until you add a key again.', 'Remove');
    if (!ok) return;
    await deleteApiKey();
    setCurrent(null);
    await refreshApiKeyStatus();
  }

  return (
    <Screen>
      <Card>
        <AppText variant="heading">Your Anthropic API key</AppText>
        <AppText>
          {current ? `Connected: ${maskKey(current)}` : 'No key saved.'}
        </AppText>
        <AppText variant="caption">
          {isPersistentKeyStorage
            ? "Stored in your device's secure keychain. It is only ever sent to Anthropic."
            : 'On the web, your key is kept in memory only and is forgotten when you close this tab. It is only ever sent to Anthropic.'}
        </AppText>
      </Card>

      <Field
        label={current ? 'Replace key' : 'API key'}
        hint="Create a key in the Anthropic Console. It starts with “sk-ant-”."
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="password"
        onSubmitEditing={save}
      />
      <Button label={busy ? 'Checking…' : 'Verify and save'} onPress={save} disabled={busy || !input.trim()} />
      {status ? (
        <View accessibilityLiveRegion="polite">
          <Banner tone={status.tone}>
            <AppText>{status.text}</AppText>
          </Banner>
        </View>
      ) : null}

      <Button
        kind="ghost"
        label="Open the Anthropic Console"
        icon="open-outline"
        accessibilityHint="Opens in your browser"
        onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}
      />

      {current ? <Button kind="danger" label="Remove key" icon="trash-outline" onPress={remove} style={styles.spaced} /> : null}

      <AppText variant="caption">
        Usage is billed by Anthropic to your account under your agreement with them. Set a spending limit in the Anthropic
        Console to control costs.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  spaced: { marginTop: Spacing.lg },
});
