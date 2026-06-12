import { createAsyncThunk } from '@reduxjs/toolkit';
import { planApiRepository } from '../../infrastructure/api/repositories/plan.api.repository';
import type {
  CreateTaskDto,
  UpdateTaskDto,
  RecordPomodoroDto,
} from '../../domain/repositories/plan.repository.interface';
import type { RootState } from '../store/index';

export const fetchTasks = createAsyncThunk(
  'plan/fetchTasks',
  async (date: string | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    if (!state.connectivity.isOnline) return rejectWithValue('offline');
    return planApiRepository.getTasks(date);
  },
);

export const createTask = createAsyncThunk(
  'plan/createTask',
  async (dto: CreateTaskDto) => planApiRepository.createTask(dto),
);

export const updateTask = createAsyncThunk(
  'plan/updateTask',
  async ({ id, ...dto }: { id: string } & UpdateTaskDto) =>
    planApiRepository.updateTask(id, dto),
);

export const deleteTask = createAsyncThunk(
  'plan/deleteTask',
  async (id: string) => {
    await planApiRepository.deleteTask(id);
    return id;
  },
);

export const fetchPomodoroPresets = createAsyncThunk(
  'plan/fetchPresets',
  async () => planApiRepository.getPomodoroPResets(),
);

export const recordPomodoroSession = createAsyncThunk(
  'plan/recordPomodoro',
  async (dto: RecordPomodoroDto) => planApiRepository.recordPomodoroSession(dto),
);

export const fetchPomodoroSessions = createAsyncThunk(
  'plan/fetchPomodoroSessions',
  async () => planApiRepository.getPomodoroSessions(),
);
