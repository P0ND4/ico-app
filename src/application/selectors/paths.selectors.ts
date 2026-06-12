import { createSelector } from '@reduxjs/toolkit';
import type { LearningPath, Chapter, Lesson } from '../../domain/entities/path.entity';
import type { RootState } from '../store/index';

export const selectAllPaths = createSelector(
  (state: RootState) => state.paths.pathIds,
  (state: RootState) => state.paths.paths,
  (pathIds, paths) =>
    pathIds.map((id) => paths[id]).filter((p): p is LearningPath => p !== undefined),
);

export const selectPathById =
  (id: string) =>
  (state: RootState): LearningPath | null =>
    state.paths.paths[id] ?? null;

export const selectChaptersByPathId = (pathId: string) =>
  createSelector(
    (state: RootState) => state.paths.chapters,
    (chapters) =>
      Object.values(chapters)
        .filter((c) => c.pathId === pathId)
        .sort((a, b) => a.order - b.order),
  );

export const selectChapterById =
  (id: string) =>
  (state: RootState): Chapter | null =>
    state.paths.chapters[id] ?? null;

const EMPTY_LESSONS: Lesson[] = [];

export const selectLessonsByChapterId =
  (chapterId: string) =>
  (state: RootState): Lesson[] =>
    state.paths.lessons[chapterId] ?? EMPTY_LESSONS;

export const selectActivePaths = createSelector(
  [selectAllPaths],
  (paths) => paths.filter((p) => p.status !== 'completed' && p.status !== 'archived'),
);

export const selectCompletedPaths = createSelector(
  [selectAllPaths],
  (paths) => paths.filter((p) => p.status === 'completed'),
);

export const selectPathsStatus = (state: RootState) => state.paths.status;
export const selectGeneratingPathId = (state: RootState) => state.paths.generatingPathId;
