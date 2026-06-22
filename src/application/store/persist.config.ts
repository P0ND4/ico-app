import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTransform } from 'redux-persist';
import type { AuthState } from '../slices/auth.slice';
import type { PlanState } from '../slices/plan.slice';

const authTransform = createTransform<AuthState, Omit<AuthState, 'sessionReady'>>(
  (inboundState) => {
    const { sessionReady: _ready, ...rest } = inboundState;
    return rest;
  },
  (outboundState) => ({
    ...outboundState,
    sessionReady: false,
  }),
  { whitelist: ['auth'] },
);

// Exclude timer state from persisted plan
const planTransform = createTransform<PlanState, Omit<PlanState, 'timerRunning' | 'timerSeconds' | 'timerPresetId'>>(
  (inboundState) => {
    const { timerRunning: _tr, timerSeconds: _ts, timerPresetId: _tp, ...rest } = inboundState;
    return rest;
  },
  (outboundState) => ({
    ...outboundState,
    taskDates: outboundState.taskDates ?? [],
    timerRunning: false,
    timerSeconds: 0,
    timerPresetId: null,
  }),
  { whitelist: ['plan'] },
);

export const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'paths', 'catalog', 'plan', 'offlineQueue'],
  transforms: [authTransform, planTransform],
};
