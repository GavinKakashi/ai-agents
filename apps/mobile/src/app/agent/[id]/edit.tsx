import { router, useLocalSearchParams } from 'expo-router';

import { AgentForm } from '@/components/agent-form';
import { EmptyState, Screen } from '@/components/ui';
import { useApp } from '@/state/app-store';

export default function EditAgent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { agents, updateAgent } = useApp();
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    return (
      <Screen>
        <EmptyState icon="help-circle-outline" title="Agent not found" body="It may have been deleted." />
      </Screen>
    );
  }

  return (
    <Screen>
      <AgentForm
        initial={agent}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateAgent(agent.id, values);
          router.back();
        }}
      />
    </Screen>
  );
}
