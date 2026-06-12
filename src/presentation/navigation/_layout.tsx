import { Stack } from "expo-router";
import { AppProvider } from "../providers/AppProvider";
import { ErrorBoundary } from "../providers/ErrorBoundary";

export default () => (
  <ErrorBoundary>
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
        <Stack.Screen name="(shared)" />
      </Stack>
    </AppProvider>
  </ErrorBoundary>
);
