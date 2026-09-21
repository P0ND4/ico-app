import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'ico_access_token',
  REFRESH_TOKEN: 'ico_refresh_token',
  GUEST_DEVICE_ID: 'ico_guest_device_id',
} as const;

const LOG_PREFIX = '[secure-storage]';

/**
 * SecureStore failures used to be invisible, which made a lost session
 * impossible to diagnose. Every operation now degrades gracefully and logs.
 */
function logFailure(operation: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`${LOG_PREFIX} ${operation} failed: ${message}`);
}

async function readItem(key: string, operation: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (err) {
    logFailure(operation, err);
    return null;
  }
}

async function writeItem(key: string, value: string, operation: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (err) {
    logFailure(operation, err);
  }
}

async function removeItem(key: string, operation: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    logFailure(operation, err);
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getStableDeviceId(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      return Application.getAndroidId();
    }
    if (Platform.OS === 'ios') {
      return await Application.getIosIdForVendorAsync();
    }
  } catch (err) {
    logFailure('getStableDeviceId', err);
  }
  return null;
}

export const secureStorage = {
  getAccessToken: (): Promise<string | null> => readItem(KEYS.ACCESS_TOKEN, 'getAccessToken'),

  getRefreshToken: (): Promise<string | null> => readItem(KEYS.REFRESH_TOKEN, 'getRefreshToken'),

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await Promise.all([
      writeItem(KEYS.ACCESS_TOKEN, accessToken, 'setTokens:access'),
      writeItem(KEYS.REFRESH_TOKEN, refreshToken, 'setTokens:refresh'),
    ]);
  },

  clearTokens: async (): Promise<void> => {
    await Promise.all([
      removeItem(KEYS.ACCESS_TOKEN, 'clearTokens:access'),
      removeItem(KEYS.REFRESH_TOKEN, 'clearTokens:refresh'),
    ]);
  },

  clearGuestDeviceId: (): Promise<void> =>
    removeItem(KEYS.GUEST_DEVICE_ID, 'clearGuestDeviceId'),

  getOrCreateGuestDeviceId: async (): Promise<string> => {
    // Prefer a platform-stable ID so reinstalls reuse the same account
    const stableId = await getStableDeviceId();
    if (stableId) return stableId;

    // Fallback: persist a UUID in SecureStore
    const stored = await readItem(KEYS.GUEST_DEVICE_ID, 'getGuestDeviceId');
    if (stored) return stored;

    const id = generateUUID();
    await writeItem(KEYS.GUEST_DEVICE_ID, id, 'setGuestDeviceId');
    return id;
  },
};
