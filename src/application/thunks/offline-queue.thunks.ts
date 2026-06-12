import { createAsyncThunk } from '@reduxjs/toolkit';
import { chapterApiRepository } from '../../infrastructure/api/repositories/chapter.api.repository';
import { lessonApiRepository } from '../../infrastructure/api/repositories/lesson.api.repository';
import type { RootState } from '../store/index';
import {
  enqueueCompleteChapter,
  enqueueRecordAnswer,
  removeCompleteChapter,
  removeRecordAnswer,
  setSyncing,
} from '../slices/offline-queue.slice';
import { mergeCompleteChapterResult } from '../slices/paths.slice';
import { fetchPaths } from './paths.thunks';
import { fetchProfile, fetchStats } from './user.thunks';

export const syncOfflineQueue = createAsyncThunk(
  'offlineQueue/sync',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');

    const { recordAnswers, completeChapters } = state.offlineQueue;
    if (recordAnswers.length === 0 && completeChapters.length === 0) return { synced: 0 };

    dispatch(setSyncing(true));
    let synced = 0;

    try {
      const sortedAnswers = [...recordAnswers].sort(
        (a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime(),
      );
      for (const item of sortedAnswers) {
        try {
          await lessonApiRepository.recordAnswer(
            item.pathId,
            item.chapterId,
            item.lessonId,
            item.dto,
          );
          dispatch(removeRecordAnswer(item.id));
          synced += 1;
        } catch {
          break;
        }
      }

      const sortedCompletions = [...completeChapters].sort(
        (a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime(),
      );
      for (const item of sortedCompletions) {
        try {
          const result = await chapterApiRepository.complete(item.pathId, item.chapterId, item.dto);
          dispatch(removeCompleteChapter(item.id));
          dispatch(mergeCompleteChapterResult(result));
          synced += 1;
        } catch {
          break;
        }
      }

      if (synced > 0) {
        dispatch(fetchProfile());
        dispatch(fetchStats());
        dispatch(fetchPaths());
      }
    } finally {
      dispatch(setSyncing(false));
    }

    return { synced };
  },
);

export { enqueueRecordAnswer, enqueueCompleteChapter };
