import apiClient from '../client';
import type { AuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type { AuthResponse } from '../../../domain/entities/auth.entity';

export const authApiRepository: AuthRepository = {
  loginWithGoogle: async (idToken, deviceId) => {
    const { data } = await apiClient.post<AuthResponse>('/v1/auth/google', {
      idToken,
      ...(deviceId && { deviceId }),
    });
    return data;
  },

  loginWithApple: async (identityToken, fullName, deviceId) => {
    const { data } = await apiClient.post<AuthResponse>('/v1/auth/apple', {
      identityToken,
      ...(fullName && { fullName }),
      ...(deviceId && { deviceId }),
    });
    return data;
  },

  loginAsGuest: async (deviceId) => {
    const { data } = await apiClient.post<AuthResponse>('/v1/auth/guest', deviceId ? { deviceId } : {});
    return data;
  },

  refresh: async (refreshToken) => {
    const { data } = await apiClient.post<AuthResponse>('/v1/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (refreshToken) => {
    await apiClient.post('/v1/auth/logout', refreshToken ? { refreshToken } : {});
  },

  linkGoogle: async (idToken) => {
    await apiClient.post('/v1/auth/link/google', { idToken });
  },

  linkApple: async (identityToken, fullName) => {
    await apiClient.post('/v1/auth/link/apple', {
      identityToken,
      ...(fullName && { fullName }),
    });
  },
};
