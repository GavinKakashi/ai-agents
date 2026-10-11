import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * The user's Anthropic API key.
 * - iOS/Android: stored in the Keychain / Keystore, never in plain storage,
 *   and only readable while the device is unlocked.
 * - Web: browsers have no secure keystore, so the key is held in memory only
 *   and is forgotten when the tab closes (as stated in the Privacy Policy).
 */
const KEY = 'crewdeck_anthropic_api_key';
let webMemoryKey: string | null = null;

export const isPersistentKeyStorage = Platform.OS !== 'web';

export async function getApiKey(): Promise<string | null> {
  if (Platform.OS === 'web') return webMemoryKey;
  return SecureStore.getItemAsync(KEY);
}

export async function setApiKey(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryKey = value;
    return;
  }
  await SecureStore.setItemAsync(KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function deleteApiKey(): Promise<void> {
  if (Platform.OS === 'web') {
    webMemoryKey = null;
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}

/** Show only enough of the key for the user to recognise it. */
export function maskKey(key: string): string {
  return key.length <= 12 ? '••••' : `${key.slice(0, 7)}…${key.slice(-4)}`;
}
