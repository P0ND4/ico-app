import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppSelector } from '../../application/store/hooks';
import { selectIsAuthenticated, selectSessionReady } from '../../application/selectors/auth.selectors';

export default function Index() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const sessionReady = useAppSelector(selectSessionReady);

  if (!sessionReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
