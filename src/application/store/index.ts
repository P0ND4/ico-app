import { configureStore, type Reducer } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { rootReducer } from './root-reducer';
import { persistConfig } from './persist.config';

type PersistedState = ReturnType<typeof rootReducer>;
const persistedReducer = persistReducer(
  persistConfig,
  rootReducer as Reducer<PersistedState>,
) as unknown as Reducer<PersistedState>;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
