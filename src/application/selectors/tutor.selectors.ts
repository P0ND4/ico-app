import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store/index';

const EMPTY_MESSAGES: never[] = [];

export const selectConversations = (state: RootState) => state.tutor.conversations;
export const selectActiveConversationId = (state: RootState) => state.tutor.activeConversationId;
export const selectTutorStatus = (state: RootState) => state.tutor.status;

export const selectMessagesByConversation = createSelector(
  (state: RootState) => state.tutor.messagesByConversation,
  (_: RootState, id: string | null) => id,
  (messagesByConversation, id) => (id ? messagesByConversation[id] : undefined) ?? EMPTY_MESSAGES,
);
