import { Stack } from "expo-router";

export default () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="maintenance" />
    <Stack.Screen name="paywall" />
  </Stack>
);
