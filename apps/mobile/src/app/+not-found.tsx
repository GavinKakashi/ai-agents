import { router } from 'expo-router';

import { Button, EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon="compass-outline"
        title="Page not found"
        body="This screen doesn't exist."
        action={<Button label="Go to my agents" onPress={() => router.replace('/')} />}
      />
    </Screen>
  );
}
