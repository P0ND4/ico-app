import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TutorConversation, TutorMessage } from '../../domain/entities/tutor.entity';
import {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
  deleteConversation,
  updateConversation,
} from '../thunks/tutor.thunks';

export interface TutorState {
  conversations: TutorConversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, TutorMessage[]>;
  status: 'idle' | 'loading' | 'sending';
}

const initialState: TutorState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  status: 'idle',
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.status = 'idle';
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      })
      .addCase(fetchMessages.pending, (state) => {
        if (state.status !== 'sending') state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        if (state.status === 'sending' && state.activeConversationId === conversationId) {
          return;
        }
        const current = state.messagesByConversation[conversationId] ?? [];
        if (messages.length < current.length && current.length > 0) {
          return;
        }
        state.messagesByConversation[conversationId] = messages;
        state.status = 'idle';
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'idle';
        console.warn('[tutor] fetchMessages rejected:', action.payload ?? action.error);
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, content } = action.meta.arg as { conversationId: string; content: string };
        const optimistic = {
          id: `temp-${action.meta.requestId}`,
          conversationId,
          role: 'user' as const,
          content,
          createdAt: new Date().toISOString(),
        };
        const msgs = state.messagesByConversation[conversationId] ?? [];
        state.messagesByConversation[conversationId] = [...msgs, optimistic];
        state.status = 'sending';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, messages, updatedConversation } = action.payload;
        state.messagesByConversation[conversationId] = messages;
        const idx = state.conversations.findIndex(c => c.id === conversationId);
        if (idx >= 0 && updatedConversation) {
          state.conversations[idx] = updatedConversation;
        }
        state.status = 'idle';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { conversationId } = action.meta.arg as { conversationId: string };
        if (state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] =
            state.messagesByConversation[conversationId].filter(
              (m) => !m.id.startsWith('temp-'),
            );
        }
        state.status = 'idle';
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = null;
        }
      })
      .addCase(updateConversation.pending, (state, action) => {
        const { id, title } = action.meta.arg;
        const idx = state.conversations.findIndex((c) => c.id === id);
        if (idx >= 0) {
          state.conversations[idx] = { ...state.conversations[idx], title };
        }
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated?.id ?? action.meta.arg.id;
        const idx = state.conversations.findIndex((c) => c.id === id);
        if (idx >= 0) {
          state.conversations[idx] = { ...state.conversations[idx], ...updated, title: updated?.title ?? action.meta.arg.title };
        }
      })
  },
});

export const { setActiveConversation } = tutorSlice.actions;
export default tutorSlice.reducer;
