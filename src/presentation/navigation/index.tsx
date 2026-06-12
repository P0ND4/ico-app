import { Redirect } from 'expo-router';
import { useAppSelector } from '../../application/store/hooks';
import { selectIsAuthenticated } from '../../application/selectors/auth.selectors';

export default function Index() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }
  return <Redirect href="/(auth)/login" />;
}
