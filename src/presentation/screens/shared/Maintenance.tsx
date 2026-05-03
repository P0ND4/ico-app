import React from "react";
import { View, StyleSheet } from "react-native";
import { Wrench } from "lucide-react-native";
import { useThemeColors } from "../../hooks/useThemeColors";
import AppText from "../../components/ui/typography/AppText";
import AppButton from "../../components/ui/buttons/AppButton";
import AppContainer from "../../components/ui/layout/AppContainer";

const Maintenance = () => {
  const theme = useThemeColors();

  return (
    <AppContainer>
      <View style={styles.container}>
        {/* ── Icon with Decorative Circles ── */}
        <View style={styles.iconWrapper}>
          <View
            style={[
              styles.circle,
              styles.circleLarge,
              { backgroundColor: theme.border },
            ]}
          />
          <View
            style={[
              styles.circle,
              styles.circleMedium,
              { backgroundColor: theme.border },
            ]}
          />
          <View
            style={[
              styles.circle,
              styles.circleSmall,
              { backgroundColor: theme.border },
            ]}
          />
          <Wrench size={64} color={theme.accent} />
        </View>

        {/* ── Title ── */}
        <AppText variant="bigTitle" align="center" style={styles.title}>
          En mantenimiento
        </AppText>

        {/* ── Description ── */}
        <AppText
          variant="paragraph"
          muted
          align="center"
          style={styles.description}
        >
          Estamos mejorando la experiencia. Volvé en unos minutos.
        </AppText>

        {/* ── Retry Button ── */}
        <AppButton
          variant="primary"
          onPress={() => {
            console.log("Retry pressed");
          }}
          style={styles.retryButton}
        >
          <AppText color={theme.textOnPrimary}>Reintentar</AppText>
        </AppButton>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconWrapper: {
    marginBottom: 24,
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.3,
  },
  circleLarge: {
    width: 32,
    height: 32,
    top: 8,
    right: -4,
  },
  circleMedium: {
    width: 24,
    height: 24,
    bottom: 0,
    left: -6,
  },
  circleSmall: {
    width: 16,
    height: 16,
    top: "45%",
    left: -14,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 22,
  },
  retryButton: {
    minWidth: 160,
  },
});

export default React.memo(Maintenance);
