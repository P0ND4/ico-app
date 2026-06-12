import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import FloatingTabBar from "../../../components/ui/navigation/FloatingTabBar";

const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          tabBarLabel: "Inicio",
        }}
      />
      <Tabs.Screen
        name="tutor"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
          tabBarLabel: "Tutor",
        }}
      />
      <Tabs.Screen
        name="learning-path"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="git-network" size={size} color={color} />,
          tabBarLabel: "Ruta",
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
          tabBarLabel: "Resumen",
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
          tabBarLabel: "Plan",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
