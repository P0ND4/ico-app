import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApiRepository } from '../../infrastructure/api/repositories/auth.api.repository';
import { signOutFromGoogle } from '../../infrastructure/auth/google-signin.utils';
import { secureStorage } from '../../infrastructure/storage/secure-storage';
import { setAuthenticated, logout as logoutAction, setSessionReady } from '../slices/auth.slice';
import { fetchProfile, fetchStats } from './user.thunks';
import { fetchPaths } from './paths.thunks';
import type { RootState } from '../store/index';
import { parseApiError } from '../../infrastructure/api/auth-error.utils';

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
      const refreshToken = await secureStorage.getRefreshToken();
      const { auth } = getState() as RootState;

      if (!refreshToken) {
        if (auth.isAuthenticated) {
          dispatch(logoutAction());
        }
        return;
      }

      const applyAuth = async (response: Awaited<ReturnType<typeof authApiRepository.refresh>>) => {
        await secureStorage.setTokens(response.accessToken, response.refreshToken);
        dispatch(
          setAuthenticated({
            userId: response.user.id,
            isGuest: auth.isAuthenticated ? auth.isGuest : isGuestUser(response.user),
          }),
        );
        await loadUserBootstrapData(dispatch);
      };

      if (auth.isAuthenticated && auth.userId) {
        try {
          await dispatch(fetchProfile()).unwrap();
          await Promise.all([dispatch(fetchStats()), dispatch(fetchPaths())]);
          return;
        } catch {
          try {
            await applyAuth(await authApiRepository.refresh(refreshToken));
          } catch {
            await secureStorage.clearTokens();
            dispatch(logoutAction());
          }
        }
        return;
      }

      try {
        await applyAuth(await authApiRepository.refresh(refreshToken));
      } catch {
        await secureStorage.clearTokens();
        dispatch(logoutAction());
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
