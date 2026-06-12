import type { RootState } from '../store/index';

export const selectSummaries = (state: RootState) => state.summaries.summaries;
export const selectSummariesStatus = (state: RootState) => state.summaries.status;
export const selectActiveSummaryId = (state: RootState) => state.summaries.activeSummaryId;
export const selectActiveSummary = (state: RootState) =>
  state.summaries.summaries.find((s) => s.id === state.summaries.activeSummaryId) ?? null;
