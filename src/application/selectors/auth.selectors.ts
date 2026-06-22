import type { RootState } from '../store/index';

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsGuest = (state: RootState) => state.auth.isGuest;
export const selectSessionReady = (state: RootState) => state.auth.sessionReady;
export const selectUserId = (state: RootState) => state.auth.userId;
