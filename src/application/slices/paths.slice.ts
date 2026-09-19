import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LearningPath, Chapter, Lesson, CompleteChapterResult } from '../../domain/entities/path.entity';
import {
  fetchPaths,
  generatePath,
  fetchPathWithChapters,
  fetchChapterWithLessons,
  fetchPathJob,
  updatePath,
  deletePath,
  restorePath,
} from '../thunks/paths.thunks';

export interface PathsState {
  paths: Record<string, LearningPath>;
  pathIds: string[];
  chapters: Record<string, Chapter>;
  lessons: Record<string, Lesson[]>;
  generatingPathId: string | null;
  status: 'idle' | 'loading' | 'generating' | 'error';
  error: string | null;
}

const initialState: PathsState = {
  paths: {},
  pathIds: [],
  chapters: {},
  lessons: {},
  generatingPathId: null,
  status: 'idle',
  error: null,
};

function applyCompleteChapterResult(state: PathsState, payload: CompleteChapterResult) {
  const { chapter, nextChapterUnlocked, pathCompleted } = payload;
  const previousChapter = state.chapters[chapter.id];
  const wasAlreadyCompleted = previousChapter?.status === 'completed';
  const { lessons: _l2, ...chapterWithoutLessons } = chapter;
  state.chapters[chapter.id] = chapterWithoutLessons;
  const pathId = chapter.pathId ?? previousChapter?.pathId;
  const path = pathId ? state.paths[pathId] : Object.values(state.paths).find(p =>
    Object.values(state.chapters).some(c => c.id === chapter.id && c.pathId === p.id)
  );
  if (path && !wasAlreadyCompleted) {
    path.completedChapterCount = (path.completedChapterCount ?? 0) + 1;
    path.earnedXp = (path.earnedXp ?? 0) + (chapter.earnedXp ?? 0);
    if (pathCompleted) path.status = 'completed';
  }
  if (nextChapterUnlocked) {
    const chaptersList = Object.values(state.chapters)
      .filter(c => c.pathId === chapter.pathId)
      .sort((a, b) => a.order - b.order);
    const currentIndex = chaptersList.findIndex(c => c.id === chapter.id);
    if (currentIndex >= 0 && currentIndex + 1 < chaptersList.length) {
      const nextChapter = chaptersList[currentIndex + 1];
      if (nextChapter) {
        state.chapters[nextChapter.id] = { ...nextChapter, status: 'current' };
      }
    }
  }
}

const pathsSlice = createSlice({
  name: 'paths',
  initialState,
  reducers: {
    mergeCompleteChapterResult: (state, action: PayloadAction<CompleteChapterResult>) => {
      applyCompleteChapterResult(state, action.payload);
    },
    applyOptimisticChapterComplete: (
      state,
      action: PayloadAction<{
        pathId: string;
        chapterId: string;
        earnedXp: number;
        correctCount: number;
        totalQuestions: number;
      }>,
    ) => {
      const { pathId, chapterId, earnedXp, correctCount, totalQuestions } = action.payload;
      const chapter = state.chapters[chapterId];
      if (!chapter || chapter.status === 'completed') return;

      chapter.status = 'completed';
      chapter.earnedXp = earnedXp;
      chapter.correctAnswers = correctCount;
      chapter.totalQuestions = totalQuestions;
      chapter.completedAt = new Date().toISOString();

      const path = state.paths[pathId];
      if (path) {
        path.completedChapterCount = (path.completedChapterCount ?? 0) + 1;
        path.earnedXp = (path.earnedXp ?? 0) + earnedXp;
      }

      const chaptersList = Object.values(state.chapters)
        .filter((c) => c.pathId === pathId)
        .sort((a, b) => a.order - b.order);
      const currentIndex = chaptersList.findIndex((c) => c.id === chapterId);

      if (currentIndex >= 0 && currentIndex + 1 < chaptersList.length) {
        const nextChapter = chaptersList[currentIndex + 1];
        if (nextChapter && nextChapter.status !== 'completed') {
          state.chapters[nextChapter.id] = { ...nextChapter, status: 'current' };
        }
      } else if (currentIndex === chaptersList.length - 1 && path) {
        path.status = 'completed';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPaths
      .addCase(fetchPaths.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPaths.fulfilled, (state, action) => {
        state.status = 'idle';
        state.paths = {};
        state.pathIds = [];
        for (const path of action.payload) {
          state.paths[path.id] = path;
          state.pathIds.push(path.id);
        }
      })
      .addCase(fetchPaths.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to fetch paths';
      })
      // generatePath
      .addCase(generatePath.pending, (state) => {
        state.status = 'generating';
        state.generatingPathId = null;
      })
      .addCase(generatePath.fulfilled, (state, action) => {
        const job = action.payload;
        if (job.status === 'completed') {
          state.status = 'idle';
          state.generatingPathId = job.pathId;
        }
        // status === 'processing': keep 'generating', poll fetchPathJob for progress
      })
      .addCase(generatePath.rejected, (state) => { state.status = 'error'; })
      // fetchPathJob — poll until job completes
      .addCase(fetchPathJob.fulfilled, (state, action) => {
        const job = action.payload;
        if (job.status === 'completed') {
          state.status = 'idle';
          state.generatingPathId = job.pathId;
        } else if (job.status === 'failed') {
          state.status = 'error';
          state.generatingPathId = null;
        }
        // pending: leave status as 'generating', keep polling
      })
      // fetchPathWithChapters
      .addCase(fetchPathWithChapters.fulfilled, (state, action) => {
        const path = action.payload;
        state.paths[path.id] = path;
        if (!state.pathIds.includes(path.id)) state.pathIds.push(path.id);
        if (path.chapters) {
          for (const chapter of path.chapters) {
            const { lessons: _l, ...chapterWithoutLessons } = chapter;
            // Backend ChapterSummaryDto does not include pathId — inject it here
            state.chapters[chapter.id] = { ...chapterWithoutLessons, pathId: path.id };
          }
        }
      })
      // fetchChapterWithLessons
      .addCase(fetchChapterWithLessons.fulfilled, (state, action) => {
        const chapter = action.payload;
        const { lessons, ...chapterWithoutLessons } = chapter;
        state.chapters[chapter.id] = chapterWithoutLessons;
        if (lessons) {
          state.lessons[chapter.id] = lessons;
        }
      })
      // completeChapter
      .addCase('paths/completeChapter/fulfilled', (state, action: PayloadAction<CompleteChapterResult>) => {
        applyCompleteChapterResult(state, action.payload);
      })
      // updatePath
      .addCase(updatePath.fulfilled, (state, action) => {
        const { chapters: _c, ...path } = action.payload;
        const existing = state.paths[path.id];
        // The API answers with the detail shape, so merge to keep list-only fields.
        state.paths[path.id] = existing ? { ...existing, ...path } : (path as LearningPath);
      })
      // deletePath — soft delete: the path stays in the store so it can be restored
      .addCase(deletePath.fulfilled, (state, action) => {
        const { id, deletedAt } = action.payload;
        const path = state.paths[id];
        if (path) path.deletedAt = deletedAt;
      })
      // restorePath
      .addCase(restorePath.fulfilled, (state, action) => {
        const path = state.paths[action.payload];
        if (path) path.deletedAt = null;
      });
  },
});

export const { mergeCompleteChapterResult, applyOptimisticChapterComplete } = pathsSlice.actions;
export default pathsSlice.reducer;
