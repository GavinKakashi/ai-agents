import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useApp } from '@/state/app-store';

export function useResolvedScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const { settings } = useApp();
  if (settings.theme !== 'system') return settings.theme;
  return system === 'dark' ? 'dark' : 'light';
}

export function useTheme(): ThemeColors {
  return Colors[useResolvedScheme()];
}
