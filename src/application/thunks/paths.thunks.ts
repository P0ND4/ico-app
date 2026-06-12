import { createAsyncThunk } from '@reduxjs/toolkit';
import { pathApiRepository } from '../../infrastructure/api/repositories/path.api.repository';
import { chapterApiRepository } from '../../infrastructure/api/repositories/chapter.api.repository';
import { lessonApiRepository } from '../../infrastructure/api/repositories/lesson.api.repository';
import type { GeneratePathDto, CompleteChapterDto, RecordAnswerDto, CompleteChapterResult } from '../../domain/entities/path.entity';
import type { UpdatePathDto } from '../../domain/repositories/path.repository.interface';
import type { RootState } from '../store/index';
import { enqueueCompleteChapter, enqueueRecordAnswer } from '../slices/offline-queue.slice';
import { fetchProfile, fetchStats } from './user.thunks';

function buildOptimisticCompleteResult(
  state: RootState,
  pathId: string,
  chapterId: string,
): CompleteChapterResult {
  const chapter = state.paths.chapters[chapterId];
  const path = state.paths.paths[pathId];
  const chaptersList = Object.values(state.paths.chapters)
    .filter((c) => c.pathId === pathId)
    .sort((a, b) => a.order - b.order);
  const currentIndex = chaptersList.findIndex((c) => c.id === chapterId);
  const hasNext = currentIndex >= 0 && currentIndex + 1 < chaptersList.length;
  const nextChapterUnlocked = hasNext && chaptersList[currentIndex + 1]?.status === 'current';

  return {
    chapter: chapter!,
    nextChapterUnlocked,
    pathCompleted: path?.status === 'completed',
  };
}

export const fetchPaths = createAsyncThunk(
  'paths/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return pathApiRepository.getAll();
  },
);

export const generatePath = createAsyncThunk(
  'paths/generate',
  async (dto: GeneratePathDto, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return pathApiRepository.generate(dto);
  },
);

export const fetchPathWithChapters = createAsyncThunk(
  'paths/fetchWithChapters',
  async (pathId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) {
      const cached = state.paths.paths[pathId];
      if (cached) return cached;
      return rejectWithValue('offline');
    }
    return pathApiRepository.getById(pathId);
  },
);

export const fetchChapterWithLessons = createAsyncThunk(
  'paths/fetchChapterWithLessons',
  async (
    { pathId, chapterId }: { pathId: string; chapterId: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) {
      const cached = state.paths.chapters[chapterId];
      const lessons = state.paths.lessons[chapterId];
      if (cached && lessons) return { ...cached, lessons };
      return rejectWithValue('offline');
    }
    return chapterApiRepository.getWithLessons(pathId, chapterId);
  },
);

export const completeChapter = createAsyncThunk(
  'paths/completeChapter',
  async (
    {
      pathId,
      chapterId,
      ...dto
    }: { pathId: string; chapterId: string } & CompleteChapterDto,
    { getState, rejectWithValue, dispatch },
  ) => {
    const state = getState() as RootState;

    if (!state.connectivity.isOnline) {
      dispatch(enqueueCompleteChapter({ pathId, chapterId, dto }));
      dispatch({
        type: 'paths/applyOptimisticChapterComplete',
        payload: { pathId, chapterId, ...dto },
      });
      return buildOptimisticCompleteResult(getState() as RootState, pathId, chapterId);
    }

    try {
      const result = await chapterApiRepository.complete(pathId, chapterId, dto);
      dispatch(fetchProfile());
      dispatch(fetchStats());
      return result;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const recordAnswer = createAsyncThunk(
  'paths/recordAnswer',
  async (
    {
      pathId,
      chapterId,
      lessonId,
      ...dto
    }: { pathId: string; chapterId: string; lessonId: string } & RecordAnswerDto,
    { getState, dispatch },
  ) => {
    const state = getState() as RootState;

    if (!state.connectivity.isOnline) {
      dispatch(enqueueRecordAnswer({ pathId, chapterId, lessonId, dto }));
      return;
    }

    try {
      await lessonApiRepository.recordAnswer(pathId, chapterId, lessonId, dto);
    } catch {
      dispatch(enqueueRecordAnswer({ pathId, chapterId, lessonId, dto }));
    }
  },
);

export const fetchPathJob = createAsyncThunk(
  'paths/fetchJob',
  async (jobId: string, { getState, rejectWithValue, dispatch }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    const job = await pathApiRepository.getJob(jobId);
    if (job.status === 'completed') {
      dispatch(fetchProfile());
    }
    return job;
  },
);

export const updatePath = createAsyncThunk(
  'paths/update',
  async ({ id, ...dto }: { id: string } & UpdatePathDto) =>
    pathApiRepository.update(id, dto),
);

export const deletePath = createAsyncThunk(
  'paths/delete',
  async (id: string) => {
    await pathApiRepository.delete(id);
    return id;
  },
);

export const askTutor = createAsyncThunk(
  'paths/askTutor',
  async (
    { pathId, question, chapterContext }: { pathId: string; question: string; chapterContext?: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    const body: { question: string; chapterContext?: string } = { question };
    if (chapterContext !== undefined) body.chapterContext = chapterContext;
    return pathApiRepository.askTutor(pathId, body);
  },
);
