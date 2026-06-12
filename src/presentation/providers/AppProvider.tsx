import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { store, persistor } from '../../application/store/index';
import { setStoreRef } from '../../infrastructure/api/client';
import { setOnline } from '../../application/slices/connectivity.slice';
import { fetchCatalog } from '../../application/thunks/catalog.thunks';
import { fetchProfile, fetchStats } from '../../application/thunks/user.thunks';
import { fetchPaths } from '../../application/thunks/paths.thunks';
import { selectIsAuthenticated } from '../../application/selectors/auth.selectors';
import { selectIsOnline } from '../../application/selectors/connectivity.selectors';
import { useAppSelector } from '../../application/store/hooks';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { preloadSounds, playSound } from '../../infrastructure/sound/useSoundEffect';
import { useIsDarkMode } from '../hooks/useThemeColors';
import GlobalPaywallModal from './GlobalPaywallModal';
import { configureGoogleSignIn } from '../../infrastructure/auth/google-signin.utils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

setStoreRef(store);

function LoadingGate() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

function ThemeStatusBar() {
  const isDark = useIsDarkMode();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function StartupFetcher() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isOnline = useAppSelector(selectIsOnline);

  useEffect(() => {
    void preloadSounds().then(() => playSound('splash'));
  }, []);

  useEffect(() => {
    if (isAuthenticated && isOnline) {
      store.dispatch(fetchCatalog());
      store.dispatch(fetchProfile());
      store.dispatch(fetchStats());
      store.dispatch(fetchPaths());
    }
  }, [isAuthenticated, isOnline]);

  return null;
}

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  useEffect(() => {
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      configureGoogleSignIn(GoogleSignin);
    } catch {
      // Google Sign-In no disponible en este build
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      store.dispatch(setOnline(netState.isConnected ?? false));
    });
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <ThemeStatusBar />
      <PersistGate loading={<LoadingGate />} persistor={persistor}>
        <StartupFetcher />
        {children}
        <GlobalPaywallModal />
      </PersistGate>
    </Provider>
  );
}
