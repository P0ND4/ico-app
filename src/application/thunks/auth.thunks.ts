import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApiRepository } from '../../infrastructure/api/repositories/auth.api.repository';
import { signOutFromGoogle } from '../../infrastructure/auth/google-signin.utils';
import { secureStorage } from '../../infrastructure/storage/secure-storage';
import { setAuthenticated, logout as logoutAction, setSessionReady } from '../slices/auth.slice';
import { fetchProfile, fetchStats } from './user.thunks';
import { fetchPaths } from './paths.thunks';
import type { RootState } from '../store/index';
import { parseApiError } from '../../infrastructure/api/auth-error.utils';
import { refreshSession, RefreshAuthError } from '../../infrastructure/api/token-refresh';
import { selectIsOnline } from '../selectors/connectivity.selectors';
import type { AuthResponse } from '../../domain/entities/auth.entity';

function loadUserBootstrapData(dispatch: (action: unknown) => unknown) {
  return Promise.all([dispatch(fetchProfile()), dispatch(fetchStats()), dispatch(fetchPaths())]);
}

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (idToken: string, { dispatch }) => {
    const deviceId = await secureStorage.getOrCreateGuestDeviceId();
    const response = await authApiRepository.loginWithGoogle(idToken, deviceId);
    await secureStorage.setTokens(response.accessToken, response.refreshToken);
    dispatch(setAuthenticated({ userId: response.user.id, isGuest: false }));
    await loadUserBootstrapData(dispatch);
    return response;
  },
);

export const loginWithApple = createAsyncThunk(
  'auth/loginWithApple',
  async (
    { identityToken, fullName }: { identityToken: string; fullName?: string },
    { dispatch },
  ) => {
    const deviceId = await secureStorage.getOrCreateGuestDeviceId();
    const response = await authApiRepository.loginWithApple(identityToken, fullName, deviceId);
    await secureStorage.setTokens(response.accessToken, response.refreshToken);
    dispatch(setAuthenticated({ userId: response.user.id, isGuest: false }));
    await loadUserBootstrapData(dispatch);
    return response;
  },
);

export const loginAsGuest = createAsyncThunk(
  'auth/loginAsGuest',
  async (_, { dispatch }) => {
    const deviceId = await secureStorage.getOrCreateGuestDeviceId();
    const response = await authApiRepository.loginAsGuest(deviceId);
    await secureStorage.setTokens(response.accessToken, response.refreshToken);
    dispatch(setAuthenticated({ userId: response.user.id, isGuest: true }));
    await loadUserBootstrapData(dispatch);
    return response;
  },
);

function isGuestUser(user: { email: string | null }): boolean {
  return user.email === null;
}

export const restoreAuthSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { dispatch, getState }) => {
    try {
      const { auth } = getState() as RootState;
      const hasStoredSession = (await secureStorage.getRefreshToken()) !== null;

      if (!hasStoredSession) {
        if (auth.isAuthenticated) {
          dispatch(logoutAction());
        }
        return;
      }

      const applyAuth = async (response: AuthResponse) => {
        // refreshSession() already persisted the rotated tokens.
        dispatch(
          setAuthenticated({
            userId: response.user.id,
            isGuest: auth.isAuthenticated ? auth.isGuest : isGuestUser(response.user),
          }),
        );
        await loadUserBootstrapData(dispatch);
      };

      const hasPersistedSession = auth.isAuthenticated && auth.userId !== null;

      // Fast path: a persisted session plus known-offline means we trust the
      // stored session and let the user work with cached content.
      if (hasPersistedSession && !selectIsOnline(getState() as RootState)) {
        return;
      }

      if (hasPersistedSession) {
        try {
          await dispatch(fetchProfile()).unwrap();
          await Promise.all([dispatch(fetchStats()), dispatch(fetchPaths())]);
        } catch {
          // The refresh interceptor is the sole authority on session death: if
          // the refresh token was rejected it already cleared the session and
          // dispatched logout. Every other failure (network, timeout, 5xx) must
          // leave the session intact so the user keeps cached content.
        }
        return;
      }

      try {
        await applyAuth(await refreshSession());
      } catch (err) {
        if (err instanceof RefreshAuthError) {
          await secureStorage.clearTokens();
          dispatch(logoutAction());
          return;
        }
        // RefreshNetworkError: never log out. A persisted session stays intact
        // so the user keeps access to offline content.
      }
    } finally {
      dispatch(setSessionReady(true));
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      const refreshToken = await secureStorage.getRefreshToken();
      await authApiRepository.logout(refreshToken ?? undefined);
    } finally {
      await signOutFromGoogle();
      await secureStorage.clearTokens();
      dispatch(logoutAction());
    }
  },
);

export const linkGoogle = createAsyncThunk(
  'auth/linkGoogle',
  async (idToken: string, { dispatch, getState, rejectWithValue }) => {
    try {
      await authApiRepository.linkGoogle(idToken);
      const userId = (getState() as RootState).auth.userId;
      dispatch(setAuthenticated({ userId: userId ?? '', isGuest: false }));
    } catch (err) {
      return rejectWithValue(parseApiError(err));
    }
  },
);

export const linkApple = createAsyncThunk(
  'auth/linkApple',
  async (
    { identityToken, fullName }: { identityToken: string; fullName?: string },
    { dispatch, getState, rejectWithValue },
  ) => {
    try {
      await authApiRepository.linkApple(identityToken, fullName);
      const userId = (getState() as RootState).auth.userId;
      dispatch(setAuthenticated({ userId: userId ?? '', isGuest: false }));
    } catch (err) {
      return rejectWithValue(parseApiError(err));
    }
  },
);
