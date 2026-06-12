import { createAsyncThunk } from '@reduxjs/toolkit';
import { summaryApiRepository } from '../../infrastructure/api/repositories/summary.api.repository';
import type { RootState } from '../store/index';
import { fetchProfile } from './user.thunks';

export const fetchSummaries = createAsyncThunk(
  'summaries/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return summaryApiRepository.getAll();
  },
);

export const generateSummary = createAsyncThunk(
  'summaries/generate',
  async (text: string, { getState, rejectWithValue, dispatch }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    const summary = await summaryApiRepository.generateFromText(text);
    dispatch(fetchProfile());
    return summary;
  },
);

export const generateSummaryFromFile = createAsyncThunk(
  'summaries/generateFromFile',
  async (
    file: { uri: string; name: string; type: string },
    { getState, rejectWithValue, dispatch },
  ) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    const summary = await summaryApiRepository.generateFromFile(file);
    dispatch(fetchProfile());
    return summary;
  },
);

export const deleteSummary = createAsyncThunk(
  'summaries/delete',
  async (id: string) => {
    await summaryApiRepository.delete(id);
    return id;
  },
);

