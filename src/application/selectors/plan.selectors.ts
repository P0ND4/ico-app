import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store/index';

export const selectTasks = (state: RootState) => state.plan.tasks;
export const selectTaskDates = (state: RootState) => state.plan.taskDates ?? [];
export const selectPomodoroPresets = (state: RootState) => state.plan.presets;
export const selectTimerState = createSelector(
  (state: RootState) => state.plan.timerRunning,
  (state: RootState) => state.plan.timerSeconds,
  (state: RootState) => state.plan.timerPresetId,
  (running, seconds, presetId) => ({ running, seconds, presetId }),
);
