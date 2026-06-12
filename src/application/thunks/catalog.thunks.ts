import { createAsyncThunk } from '@reduxjs/toolkit';
import { catalogApiRepository } from '../../infrastructure/api/repositories/catalog.api.repository';
import type { RootState } from '../store/index';

const CATALOG_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const fetchCatalog = createAsyncThunk(
  'catalog/fetch',
  async (options: { force?: boolean } | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');

    const lastFetched = state.catalog.lastFetched;
    if (
      !options?.force &&
      lastFetched &&
      Date.now() - lastFetched < CATALOG_TTL_MS
    ) {
      return rejectWithValue('stale-ok');
    }

    const [tags, xpLevels, subscriptionPlans] = await Promise.all([
      catalogApiRepository.getTags(),
      catalogApiRepository.getXpLevels(),
      catalogApiRepository.getSubscriptionPlans(),
    ]);
    return { tags, xpLevels, subscriptionPlans };
  },
);
