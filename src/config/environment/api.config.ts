import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV = (Constants.expoConfig?.extra?.env as string) ?? 'development';

const BASE_URLS: Record<string, string> = {
  development: resolveDevelopmentApiUrl(),
  staging: 'https://api.ico-app.org/api',
  production: 'https://api.ico-app.org/api',
};

function resolveDevelopmentApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return `http://${expoHost}:3000/api`;
  }

  return 'http://127.0.0.1:3000/api';
}

export const API_BASE_URL: string = (BASE_URLS[ENV] ?? BASE_URLS['development']) as string;
