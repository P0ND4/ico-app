import type { RootState } from '../store/index';

export const selectIsOnline = (state: RootState) => state.connectivity.isOnline;
