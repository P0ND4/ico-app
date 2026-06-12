import type { PlanTask, PomodoroSession, PomodoroPreset } from '../entities/plan.entity';

export interface CreateTaskDto {
  title: string;
  scheduledDate: string;
  scheduledTime?: string;
}

export interface UpdateTaskDto {
  title?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isCompleted?: boolean;
}

export interface RecordPomodoroDto {
  durationMinutes: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
  taskId?: string;
}

export interface PlanRepository {
  getTasks(date?: string): Promise<PlanTask[]>;
  getTask(id: string): Promise<PlanTask>;
  createTask(dto: CreateTaskDto): Promise<PlanTask>;
  updateTask(id: string, dto: UpdateTaskDto): Promise<PlanTask>;
  deleteTask(id: string): Promise<void>;
  getPomodoroPResets(): Promise<PomodoroPreset[]>;
  getPomodoroSessions(date?: string): Promise<PomodoroSession[]>;
  recordPomodoroSession(dto: RecordPomodoroDto): Promise<PomodoroSession>;
}
