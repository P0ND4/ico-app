export interface PlanTask {
  id: string;
  userId: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  taskId: string | null;
  durationMinutes: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface PomodoroPreset {
  id: string;
  durationMinutes: number;
  label: string;
  isDefault: boolean;
  sortOrder: number;
}
