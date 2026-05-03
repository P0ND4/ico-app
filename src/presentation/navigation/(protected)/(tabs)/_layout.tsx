import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColors } from "../../../hooks/useThemeColors";

const TabsLayout = () => {
  const theme = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: "Inicio",
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          tabBarLabel: "Tutor",
        }}
      />
      <Tabs.Screen
        name="learning-path"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-network" size={size} color={color} />
          ),
          tabBarLabel: "Ruta",
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
          tabBarLabel: "Resumen",
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          tabBarLabel: "Plan",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
