import { Stack } from "expo-router";

export default () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="login-form" />
  </Stack>
);
