import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, UserStats } from '../../domain/entities/user.entity';
import { fetchProfile, updateProfile, fetchStats } from '../thunks/user.thunks';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserState {
  profile: User | null;
  stats: UserStats | null;
  status: 'idle' | 'loading' | 'error';
  themeMode: ThemeMode;
}

const initialState: UserState = {
  profile: null,
  stats: null,
  status: 'idle',
  themeMode: 'system',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.status = 'idle';
        if (action.payload.themeMode) {
          state.themeMode = action.payload.themeMode as ThemeMode;
        }
      })
      .addCase(fetchProfile.rejected, (state) => { state.status = 'error'; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setThemeMode } = userSlice.actions;
export default userSlice.reducer;
