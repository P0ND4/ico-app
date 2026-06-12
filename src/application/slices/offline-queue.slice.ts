import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CompleteChapterDto, CompleteChapterResult, RecordAnswerDto } from '../../domain/entities/path.entity';

export interface QueuedRecordAnswer {
  id: string;
  pathId: string;
  chapterId: string;
  lessonId: string;
  dto: RecordAnswerDto;
  queuedAt: string;
}

export interface QueuedCompleteChapter {
  id: string;
  pathId: string;
  chapterId: string;
  dto: CompleteChapterDto;
  queuedAt: string;
}

export interface OfflineQueueState {
  recordAnswers: QueuedRecordAnswer[];
  completeChapters: QueuedCompleteChapter[];
  syncing: boolean;
}

const initialState: OfflineQueueState = {
  recordAnswers: [],
  completeChapters: [],
  syncing: false,
};

function createQueueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    enqueueRecordAnswer: (
      state,
      action: PayloadAction<{
        pathId: string;
        chapterId: string;
        lessonId: string;
        dto: RecordAnswerDto;
      }>,
    ) => {
      const { pathId, chapterId, lessonId, dto } = action.payload;
      state.recordAnswers = state.recordAnswers.filter((item) => item.lessonId !== lessonId);
      state.recordAnswers.push({
        id: createQueueId(),
        pathId,
        chapterId,
        lessonId,
        dto,
        queuedAt: new Date().toISOString(),
      });
    },
    enqueueCompleteChapter: (
      state,
      action: PayloadAction<{
        pathId: string;
        chapterId: string;
        dto: CompleteChapterDto;
      }>,
    ) => {
      const { pathId, chapterId, dto } = action.payload;
      state.completeChapters = state.completeChapters.filter((item) => item.chapterId !== chapterId);
      state.completeChapters.push({
        id: createQueueId(),
        pathId,
        chapterId,
        dto,
        queuedAt: new Date().toISOString(),
      });
    },
    removeRecordAnswer: (state, action: PayloadAction<string>) => {
      state.recordAnswers = state.recordAnswers.filter((item) => item.id !== action.payload);
    },
    removeCompleteChapter: (state, action: PayloadAction<string>) => {
      state.completeChapters = state.completeChapters.filter((item) => item.id !== action.payload);
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
  },
});

export const {
  enqueueRecordAnswer,
  enqueueCompleteChapter,
  removeRecordAnswer,
  removeCompleteChapter,
  setSyncing,
} = offlineQueueSlice.actions;

export default offlineQueueSlice.reducer;
