import { StyleSheet } from "react-native";
import AppContainer from "../components/ui/layout/AppContainer";
import AppText from "../components/ui/typography/AppText";
import AppButton from "../components/ui/buttons/AppButton";
import { router } from "expo-router";

export default function App() {
  return (
    <AppContainer>
      <AppButton
        onPress={() => {
          if (true) {
            router.navigate("/(protected)/(tabs)/home");
          } else if (false) {
            router.navigate("/(auth)/(sign-in)/login-form");
          } else router.navigate("/(shared)/maintenance");
        }}
      >
        <AppText>Hola Mundo</AppText>
      </AppButton>
    </AppContainer>
  );
}

const styles = StyleSheet.create({});
