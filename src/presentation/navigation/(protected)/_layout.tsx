import { Stack, Redirect } from "expo-router";

export default function ProtectedLayout() {
  // Simulación de autenticación
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
