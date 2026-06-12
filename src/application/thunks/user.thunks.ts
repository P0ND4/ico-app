import { createAsyncThunk } from '@reduxjs/toolkit';
import { signOutFromGoogle } from '../../infrastructure/auth/google-signin.utils';
import { userApiRepository } from '../../infrastructure/api/repositories/user.api.repository';
import { secureStorage } from '../../infrastructure/storage/secure-storage';
import type { UpdateUserDto } from '../../domain/repositories/user.repository.interface';
import { logout as logoutAction } from '../slices/auth.slice';

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () =>
  userApiRepository.getProfile(),
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (dto: UpdateUserDto) => userApiRepository.updateProfile(dto),
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (_, { dispatch }) => {
    await userApiRepository.deleteAccount();
    await signOutFromGoogle();
    await secureStorage.clearTokens();
    dispatch(logoutAction());
  },
);

export const fetchStats = createAsyncThunk('user/fetchStats', async () =>
  userApiRepository.getStats(),
);
