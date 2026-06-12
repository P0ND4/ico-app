import { createAsyncThunk } from '@reduxjs/toolkit';
import { tutorApiRepository } from '../../infrastructure/api/repositories/tutor.api.repository';
import type { RootState } from '../store/index';
import { fetchProfile } from './user.thunks';

export const fetchConversations = createAsyncThunk(
  'tutor/fetchConversations',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return tutorApiRepository.getConversations();
  },
);

export const createConversation = createAsyncThunk(
  'tutor/createConversation',
  async (title: string | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return tutorApiRepository.createConversation(title);
  },
);

export const fetchMessages = createAsyncThunk(
  'tutor/fetchMessages',
  async (conversationId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    const messages = await tutorApiRepository.getMessages(conversationId);
    return { conversationId, messages };
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      return state.tutor.status !== 'sending';
    },
  },
);

export const sendMessage = createAsyncThunk(
  'tutor/sendMessage',
  async (
    { conversationId, content }: { conversationId: string; content: string },
    { getState, rejectWithValue, dispatch },
  ) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');

    await tutorApiRepository.sendMessage(conversationId, content);
    const [messages, updatedConversation] = await Promise.all([
      tutorApiRepository.getMessages(conversationId),
      tutorApiRepository.getConversation(conversationId),
    ]);
    dispatch(fetchProfile());
    return { conversationId, messages, updatedConversation };
  },
);

export const deleteConversation = createAsyncThunk(
  'tutor/deleteConversation',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    await tutorApiRepository.deleteConversation(id);
    return id;
  },
);

export const updateConversation = createAsyncThunk(
  'tutor/updateConversation',
  async ({ id, title }: { id: string; title: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return tutorApiRepository.updateConversation(id, title);
  },
);

export const exportConversationPdf = createAsyncThunk(
  'tutor/exportPdf',
  async (id: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    // POST /v1/tutor/conversations/:id/export/pdf — returns a Blob
    const apiClient = (await import('../../infrastructure/api/client')).default;
    const response = await apiClient.post<Blob>(
      `/v1/tutor/conversations/${id}/export/pdf`,
      {},
      { responseType: 'blob' },
    );
    return response.data;
  },
);
