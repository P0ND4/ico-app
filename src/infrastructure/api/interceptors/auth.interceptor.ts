import type { AxiosInstance } from 'axios';
import { secureStorage } from '../../storage/secure-storage';

export function applyAuthInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}
