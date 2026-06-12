import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isGuest: false,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (
      state,
      action: PayloadAction<{ userId: string; isGuest: boolean }>,
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.isGuest = action.payload.isGuest;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.isGuest = false;
    },
  },
});

export const { setAuthenticated, logout } = authSlice.actions;
export default authSlice.reducer;
