import apiClient from '../client';
import type {
  PlanRepository,
  CreateTaskDto,
  UpdateTaskDto,
  RecordPomodoroDto,
} from '../../../domain/repositories/plan.repository.interface';
import type { PlanTask, PomodoroSession, PomodoroPreset } from '../../../domain/entities/plan.entity';

export const planApiRepository: PlanRepository = {
  getTasks: async (date) => {
    const { data } = await apiClient.get<PlanTask[]>('/plan/tasks', {
      params: date ? { date } : undefined,
    });
    return data;
  },

  getTask: async (id) => {
    const { data } = await apiClient.get<PlanTask>(`/plan/tasks/${id}`);
    return data;
  },

  createTask: async (dto: CreateTaskDto) => {
    const { data } = await apiClient.post<PlanTask>('/plan/tasks', dto);
    return data;
  },

  updateTask: async (id, dto: UpdateTaskDto) => {
    const { data } = await apiClient.patch<PlanTask>(`/plan/tasks/${id}`, dto);
    return data;
  },

  deleteTask: async (id) => {
    await apiClient.delete(`/plan/tasks/${id}`);
  },

  getPomodoroPResets: async () => {
    const { data } = await apiClient.get<PomodoroPreset[]>('/plan/pomodoro/presets');
    return data;
  },

  getPomodoroSessions: async (date) => {
    const { data } = await apiClient.get<PomodoroSession[]>('/plan/pomodoro/sessions', {
      params: date ? { date } : undefined,
    });
    return data;
  },

  recordPomodoroSession: async (dto: RecordPomodoroDto) => {
    const { data } = await apiClient.post<PomodoroSession>('/plan/pomodoro/sessions', dto);
    return data;
  },
};
