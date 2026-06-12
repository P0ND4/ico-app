import { createSlice } from '@reduxjs/toolkit';
import type { Tag, XpLevel, SubscriptionPlan } from '../../domain/entities/catalog.entity';
import { fetchCatalog } from '../thunks/catalog.thunks';

export interface CatalogState {
  tags: Tag[];
  xpLevels: XpLevel[];
  subscriptionPlans: SubscriptionPlan[];
  lastFetched: number | null;
}

const initialState: CatalogState = {
  tags: [],
  xpLevels: [],
  subscriptionPlans: [],
  lastFetched: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCatalog.fulfilled, (state, action) => {
      state.tags = action.payload.tags;
      state.xpLevels = action.payload.xpLevels;
      state.subscriptionPlans = action.payload.subscriptionPlans;
      state.lastFetched = Date.now();
    });
  },
});

export default catalogSlice.reducer;
