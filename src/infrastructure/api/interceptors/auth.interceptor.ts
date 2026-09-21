import type { AxiosInstance } from 'axios';
import { secureStorage } from '../../storage/secure-storage';

/** Endpoints that must never carry a (possibly stale) Authorization header. */
const PUBLIC_PATHS = ['/auth/refresh', '/auth/google', '/auth/apple', '/auth/guest'];

export function applyAuthInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use(async (config) => {
    if (PUBLIC_PATHS.some((path) => config.url?.includes(path))) {
      return config;
    }

    const token = await secureStorage.getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}
