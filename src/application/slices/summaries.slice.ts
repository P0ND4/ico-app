import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Summary } from '../../domain/entities/summary.entity';
import {
  fetchSummaries,
  generateSummary,
  generateSummaryFromFile,
  deleteSummary,
} from '../thunks/summaries.thunks';

export interface SummariesState {
  summaries: Summary[];
  activeSummaryId: string | null;
  status: 'idle' | 'loading' | 'generating';
}

const initialState: SummariesState = {
  summaries: [],
  activeSummaryId: null,
  status: 'idle',
};

const summariesSlice = createSlice({
  name: 'summaries',
  initialState,
  reducers: {
    setActiveSummary: (state, action: PayloadAction<string | null>) => {
      state.activeSummaryId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummaries.fulfilled, (state, action) => {
        state.summaries = action.payload;
        state.status = 'idle';
      })
      .addCase(generateSummary.pending, (state) => { state.status = 'generating'; state.activeSummaryId = null; })
      .addCase(generateSummary.fulfilled, (state, action) => {
        state.summaries.unshift(action.payload);
        state.activeSummaryId = action.payload.id;
        state.status = 'idle';
      })
      .addCase(generateSummary.rejected, (state) => { state.status = 'idle'; })
      .addCase(generateSummaryFromFile.pending, (state) => { state.status = 'generating'; state.activeSummaryId = null; })
      .addCase(generateSummaryFromFile.fulfilled, (state, action) => {
        state.summaries.unshift(action.payload);
        state.activeSummaryId = action.payload.id;
        state.status = 'idle';
      })
      .addCase(generateSummaryFromFile.rejected, (state) => { state.status = 'idle'; })
      .addCase(deleteSummary.fulfilled, (state, action) => {
        state.summaries = state.summaries.filter(s => s.id !== action.payload);
      });
  },
});

export const { setActiveSummary } = summariesSlice.actions;
export default summariesSlice.reducer;
