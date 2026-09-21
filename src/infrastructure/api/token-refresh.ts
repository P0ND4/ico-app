import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL } from '../../config/environment/api.config';
import { secureStorage } from '../storage/secure-storage';
import type { AuthResponse } from '../../domain/entities/auth.entity';

/**
 * The refresh token was explicitly rejected by the server (401/403).
 * The session is unrecoverable and must be cleared.
 */
export class RefreshAuthError extends Error {
  constructor(message = 'Refresh token rejected') {
    super(message);
    this.name = 'RefreshAuthError';
  }
}

/**
 * The refresh could not complete for a transient reason (offline, timeout, 5xx).
 * The session is still valid and must be preserved.
 */
export class RefreshNetworkError extends Error {
  constructor(message = 'Refresh request failed') {
    super(message);
    this.name = 'RefreshNetworkError';
  }
}

/**
 * Bare client with no interceptors attached. This prevents the refresh call
 * from carrying a stale Authorization header and from recursing back into
 * the refresh interceptor.
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Mirrors response.interceptor: unwraps the { success, data, ... } envelope. */
function unwrapEnvelope<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

let inFlight: Promise<AuthResponse> | null = null;

/**
 * Single-flight refresh. The backend rotates and blacklists the refresh token
 * on every use, so concurrent callers must share one request: N parallel 401s
 * result in exactly one rotation.
 */
export function refreshSession(): Promise<AuthResponse> {
  if (inFlight) return inFlight;

  const promise = performRefresh().finally(() => {
    // Identity guard: a slow older refresh must not clear a newer one.
    if (inFlight === promise) inFlight = null;
  });
  inFlight = promise;
  return promise;
}

async function performRefresh(): Promise<AuthResponse> {
  // Always read at the moment of use: the stored token may have just rotated.
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) {
    throw new RefreshAuthError('No refresh token stored');
  }

  let response: AuthResponse;
  try {
    const { data } = await refreshClient.post('/v1/auth/refresh', { refreshToken });
    response = unwrapEnvelope<AuthResponse>(data);
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    // Only an explicit rejection kills the session. Offline/timeout/5xx do not.
    if (status === 401 || status === 403) {
      throw new RefreshAuthError(`Refresh rejected with status ${status}`);
    }
    throw new RefreshNetworkError(
      axios.isAxiosError(err) ? err.message : 'Unknown refresh failure',
    );
  }

  if (!response?.accessToken || !response?.refreshToken) {
    throw new RefreshAuthError('Malformed refresh response');
  }

  await secureStorage.setTokens(response.accessToken, response.refreshToken);
  return response;
}
