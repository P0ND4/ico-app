import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PlanTask, PomodoroSession, PomodoroPreset } from '../../domain/entities/plan.entity';
import {
  fetchTasks,
  fetchTaskDates,
  createTask,
  updateTask,
  deleteTask,
  fetchPomodoroPresets,
  recordPomodoroSession,
  fetchPomodoroSessions,
} from '../thunks/plan.thunks';

export interface PlanState {
  tasks: PlanTask[];
  taskDates: string[];
  pomodoroSessions: PomodoroSession[];
  presets: PomodoroPreset[];
  timerRunning: boolean;
  timerSeconds: number;
  timerPresetId: string | null;
  status: 'idle' | 'loading';
}

const initialState: PlanState = {
  tasks: [],
  taskDates: [],
  pomodoroSessions: [],
  presets: [],
  timerRunning: false,
  timerSeconds: 0,
  timerPresetId: null,
  status: 'idle',
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    startTimer: (state, action: PayloadAction<{ seconds: number; presetId: string }>) => {
      state.timerRunning = true;
      state.timerSeconds = action.payload.seconds;
      state.timerPresetId = action.payload.presetId;
    },
    tickTimer: (state) => {
      if (state.timerRunning && state.timerSeconds > 0) {
        state.timerSeconds -= 1;
      }
      if (state.timerSeconds === 0) {
        state.timerRunning = false;
      }
    },
    stopTimer: (state) => {
      state.timerRunning = false;
    },
    resetTimer: (state) => {
      state.timerRunning = false;
      state.timerSeconds = 0;
    },
    setTimerPreset: (state, action: PayloadAction<{ seconds: number; presetId: string }>) => {
      state.timerRunning = false;
      state.timerSeconds = action.payload.seconds;
      state.timerPresetId = action.payload.presetId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchTaskDates.fulfilled, (state, action) => {
        state.taskDates = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        if (!state.taskDates) state.taskDates = [];
        if (!state.taskDates.includes(action.payload.scheduledDate)) {
          state.taskDates.push(action.payload.scheduledDate);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(fetchPomodoroPresets.fulfilled, (state, action) => {
        state.presets = action.payload;
      })
      .addCase(recordPomodoroSession.fulfilled, (state, action) => {
        state.pomodoroSessions.push(action.payload);
      })
      .addCase(fetchPomodoroSessions.fulfilled, (state, action) => {
        state.pomodoroSessions = action.payload;
      });
  },
});

export const { startTimer, tickTimer, stopTimer, resetTimer, setTimerPreset } = planSlice.actions;
export default planSlice.reducer;
