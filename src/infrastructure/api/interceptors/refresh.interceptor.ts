import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../../storage/secure-storage';
import { getStoreRef } from '../store-ref';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function applyRefreshInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableConfig | undefined;

      if (error.response?.status !== 401 || !config || config._retry) {
        return Promise.reject(error);
      }

      // Don't retry refresh endpoint itself
      if (config.url?.includes('/auth/refresh')) {
        const store = getStoreRef();
        if (store) {
          const { logout } = await import('../../../application/slices/auth.slice');
          store.dispatch(logout());
        }
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        const refreshToken = await secureStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await client.post<{ accessToken: string; refreshToken: string }>(
          '/v1/auth/refresh',
          { refreshToken },
        );

        await secureStorage.setTokens(data.accessToken, data.refreshToken);

        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${data.accessToken}`;

        return client(config);
      } catch {
        const store = getStoreRef();
        if (store) {
          const { logout } = await import('../../../application/slices/auth.slice');
          store.dispatch(logout());
        }
        return Promise.reject(error);
      }
    },
  );
}
