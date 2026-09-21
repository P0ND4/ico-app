import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logout } from '../../../application/slices/auth.slice';
import { secureStorage } from '../../storage/secure-storage';
import { getStoreRef } from '../store-ref';
import { refreshSession, RefreshAuthError } from '../token-refresh';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function readBearer(headers: RetryableConfig['headers']): string | null {
  const raw = headers?.['Authorization'];
  if (typeof raw !== 'string') return null;
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
}

async function destroySession(): Promise<void> {
  await secureStorage.clearTokens();
  getStoreRef()?.dispatch(logout());
}

export function applyRefreshInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryableConfig | undefined;

      if (error.response?.status !== 401 || !config || config._retry) {
        return Promise.reject(error);
      }

      // Safety net: the real refresh runs on a bare client, never refresh a refresh.
      if (config.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      config._retry = true;

      try {
        const usedToken = readBearer(config.headers);
        const storedToken = await secureStorage.getAccessToken();

        // The token rotated while this request was in flight: retry with the
        // fresh one instead of burning another single-use refresh token.
        if (storedToken && usedToken && storedToken !== usedToken) {
          config.headers = config.headers ?? {};
          config.headers['Authorization'] = `Bearer ${storedToken}`;
          return await client(config);
        }

        // Shared single-flight refresh: N concurrent 401s => 1 rotation.
        const { accessToken } = await refreshSession();

        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        return await client(config);
      } catch (refreshError) {
        // Only an explicit rejection of the refresh token ends the session.
        // A network failure leaves it intact so the user keeps offline access.
        if (refreshError instanceof RefreshAuthError) {
          await destroySession();
        }
        return Promise.reject(error);
      }
    },
  );
}
