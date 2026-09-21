import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTransform } from 'redux-persist';
import type { AuthState } from '../slices/auth.slice';
import type { PlanState } from '../slices/plan.slice';
import type { CouponsState } from '../slices/coupons.slice';

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

// Persist only the redemption history: a stale error or a hung 'redeeming'
// status must never survive a restart.
const couponsTransform = createTransform<CouponsState, Pick<CouponsState, 'redemptions'>>(
  (inboundState) => ({ redemptions: inboundState.redemptions }),
  (outboundState) => ({
    redemptions: outboundState.redemptions ?? [],
    historyStatus: 'idle',
    redeemStatus: 'idle',
    error: null,
    lastRedeemed: null,
  }),
  { whitelist: ['coupons'] },
);

export const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'paths', 'catalog', 'plan', 'offlineQueue', 'coupons'],
  transforms: [authTransform, planTransform, couponsTransform],
};
