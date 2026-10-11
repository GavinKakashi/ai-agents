import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MODELS, PRICES_AS_OF } from '@/lib/models';
import type { AgentTemplate } from '@/lib/templates';
import type { Effort } from '@/lib/types';
import { AppText, Button, Field, Segmented, textStyles } from './ui';

const MAX_TOKEN_OPTIONS = [
  { value: '4000', label: '4K' },
  { value: '8000', label: '8K' },
  { value: '16000', label: '16K' },
];

export function AgentForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: AgentTemplate;
  submitLabel: string;
  onSubmit: (values: AgentTemplate) => Promise<void>;
}) {
  const theme = useTheme();
  const [values, setValues] = useState<AgentTemplate>(initial);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AgentTemplate>(key: K, v: AgentTemplate[K]) => setValues((prev) => ({ ...prev, [key]: v }));

  async function submit() {
    if (!values.name.trim()) {
      setNameError('Give your agent a name.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...values, name: values.name.trim(), description: values.description.trim() });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Field
        label="Name"
        value={values.name}
        onChangeText={(t) => {
          set('name', t);
          if (t.trim()) setNameError(undefined);
        }}
        error={nameError}
        maxLength={60}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <Field
        label="Description (optional)"
        hint="A short note to help you recognise this agent."
        value={values.description}
        onChangeText={(t) => set('description', t)}
        maxLength={140}
      />
      <Field
        label="Instructions"
        hint="The system prompt: who the agent is and how it should behave."
        value={values.systemPrompt}
        onChangeText={(t) => set('systemPrompt', t)}
        multiline
        maxLength={20000}
      />

      <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Model">
        <Text style={[textStyles.label, { color: theme.text }]}>Model</Text>
        {MODELS.map((m) => {
          const selected = values.model === m.id;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${m.label}. ${m.summary} $${m.inputPerMTok} input and $${m.outputPerMTok} output per million tokens.`}
              onPress={() => set('model', m.id)}
              style={[
                styles.option,
                { borderColor: selected ? theme.primary : theme.border, backgroundColor: theme.surface, borderWidth: selected ? 2 : 1 },
              ]}>
              <Text style={[textStyles.label, { color: theme.text }]}>
                {selected ? '● ' : '○ '}
                {m.label}
              </Text>
              <Text style={[textStyles.caption, { color: theme.textSecondary }]}>{m.summary}</Text>
              <Text style={[textStyles.caption, { color: theme.textSecondary }]}>
                ${m.inputPerMTok} in / ${m.outputPerMTok} out per 1M tokens
              </Text>
            </Pressable>
          );
        })}
        <AppText variant="caption">
          {`Anthropic's published prices as of ${PRICES_AS_OF}. You pay Anthropic directly; check their pricing page for current rates.`}
        </AppText>
      </View>

      <Segmented<Effort>
        label="Effort"
        value={values.effort}
        onChange={(v) => set('effort', v)}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]}
      />
      <AppText variant="caption">Higher effort gives the model more time to think. It is usually slower and uses more tokens.</AppText>

      <Segmented
        label="Maximum reply length"
        value={String(values.maxTokens)}
        onChange={(v) => set('maxTokens', Number(v))}
        options={MAX_TOKEN_OPTIONS}
      />

      <Button label={saving ? 'Saving…' : submitLabel} onPress={submit} disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.lg },
  group: { gap: Spacing.sm },
  option: { borderRadius: Radius.md, padding: Spacing.md, gap: 2 },
});
