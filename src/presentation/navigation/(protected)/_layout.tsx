import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { useAppSelector } from '../../../application/store/hooks';
import { selectIsAuthenticated } from '../../../application/selectors/auth.selectors';
import { OfflineBanner } from '../../components/ui/layout/OfflineBanner';

export default function ProtectedLayout() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(learning)/path-generating" />
        <Stack.Screen name="(learning)/all-paths" />
        <Stack.Screen name="(learning)/path-detail" />
        <Stack.Screen name="(learning)/chapter-content" />
        <Stack.Screen name="(learning)/chapter-complete" />
        <Stack.Screen name="(learning)/path-complete" />
        <Stack.Screen name="(learning)/exam-result" />
        <Stack.Screen name="(profile)/profile" />
      </Stack>
      <OfflineBanner />
    </View>
  );
}
