import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-theme';
import { AppProvider, useApp } from '@/state/app-store';
import { SubscriptionProvider } from '@/state/subscription';

SplashScreen.preventAutoHideAsync();

/** Screens that can be viewed before the user has accepted the terms. */
const PUBLIC_ROUTES = new Set(['welcome', 'legal']);

function RootNavigator() {
  const { ready, consentCurrent } = useApp();
  const segments = useSegments();
  const scheme = useResolvedScheme();
  const colors = Colors[scheme];

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    const first = segments[0] ?? '';
    if (!consentCurrent && !PUBLIC_ROUTES.has(first)) router.replace('/welcome');
  }, [ready, consentCurrent, segments]);

  const navTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.surfaceAlt,
    },
  };

  if (!ready) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerTintColor: colors.primary, headerTitleStyle: { color: colors.text } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, title: 'Welcome', gestureEnabled: false }} />
        <Stack.Screen name="agent/new" options={{ title: 'New agent', presentation: 'modal' }} />
        <Stack.Screen name="agent/[id]/index" options={{ title: 'Agent' }} />
        <Stack.Screen name="agent/[id]/edit" options={{ title: 'Edit agent', presentation: 'modal' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Conversation' }} />
        <Stack.Screen name="settings/api-key" options={{ title: 'API key' }} />
        <Stack.Screen name="settings/privacy" options={{ title: 'Privacy center' }} />
        <Stack.Screen name="settings/about" options={{ title: 'About & business details' }} />
        <Stack.Screen name="settings/licenses" options={{ title: 'Open-source licences' }} />
        <Stack.Screen name="legal/[slug]" options={{ title: '' }} />
        <Stack.Screen name="subscribe" options={{ title: 'Subscription', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <SubscriptionProvider>
          <RootNavigator />
        </SubscriptionProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
