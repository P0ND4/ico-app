import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'ico_access_token',
  REFRESH_TOKEN: 'ico_refresh_token',
  GUEST_DEVICE_ID: 'ico_guest_device_id',
} as const;

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
  } catch {
    // fall through to SecureStore fallback
  }
  return null;
}

export const secureStorage = {
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),

  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  setTokens: (accessToken: string, refreshToken: string): Promise<void[]> =>
    Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]),

  clearTokens: (): Promise<void[]> =>
    Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]),

  clearGuestDeviceId: (): Promise<void> =>
    SecureStore.deleteItemAsync(KEYS.GUEST_DEVICE_ID),

  getOrCreateGuestDeviceId: async (): Promise<string> => {
    // Prefer a platform-stable ID so reinstalls reuse the same account
    const stableId = await getStableDeviceId();
    if (stableId) return stableId;

    // Fallback: persist a UUID in SecureStore
    const stored = await SecureStore.getItemAsync(KEYS.GUEST_DEVICE_ID);
    if (stored) return stored;
    const id = generateUUID();
    await SecureStore.setItemAsync(KEYS.GUEST_DEVICE_ID, id);
    return id;
  },
};
