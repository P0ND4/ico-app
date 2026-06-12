import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../slices/auth.slice';
import userReducer from '../slices/user.slice';
import pathsReducer from '../slices/paths.slice';
import tutorReducer from '../slices/tutor.slice';
import summariesReducer from '../slices/summaries.slice';
import planReducer from '../slices/plan.slice';
import catalogReducer from '../slices/catalog.slice';
import connectivityReducer from '../slices/connectivity.slice';
import paywallReducer from '../slices/paywall.slice';
import offlineQueueReducer from '../slices/offline-queue.slice';

export const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  paths: pathsReducer,
  tutor: tutorReducer,
  summaries: summariesReducer,
  plan: planReducer,
  catalog: catalogReducer,
  connectivity: connectivityReducer,
  paywall: paywallReducer,
  offlineQueue: offlineQueueReducer,
});
