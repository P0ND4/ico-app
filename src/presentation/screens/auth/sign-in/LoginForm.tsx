import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Apple, GraduationCap } from "lucide-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import AppContainer from "../../../components/ui/layout/AppContainer";

const LoginForm = () => {
  const theme = useThemeColors();

  const dividerStyle = useMemo(
    () => ({ backgroundColor: theme.border }),
    [theme.border],
  );

  return (
    <AppContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo Section ── */}
        <View style={styles.logoSection}>
          <GraduationCap size={48} color={theme.primary} />
          <AppText variant="bigTitle" align="center">
            AutoLearner
          </AppText>
          <AppText variant="smallParagraph" muted align="center">
            Aprende a aprender
          </AppText>
        </View>

        {/* ── Social Auth Buttons ── */}
        <View style={styles.buttonGroup}>
          {/* Apple Button */}
          <AppButton
            backgroundColor="#000000"
            labelColor="#FFFFFF"
            widthFull
            style={styles.socialButton}
            onPress={() => {
              console.log("Apple auth pressed");
            }}
          >
            <View style={styles.buttonContent}>
              <Apple color="#FFFFFF" size={20} />
              <AppText color="#FFFFFF" weight="600">
                Continuar con Apple
              </AppText>
            </View>
          </AppButton>

          {/* Google Button */}
          <AppButton
            variant="secondary"
            widthFull
            style={styles.socialButton}
            onPress={() => {
              console.log("Google auth pressed");
            }}
          >
            <View style={styles.buttonContent}>
              <View
                style={[
                  styles.googleIconCircle,
                  { borderColor: theme.border },
                ]}
              >
                <AppText
                  variant="smallParagraph"
                  weight="700"
                  align="center"
                >
                  G
                </AppText>
              </View>
              <AppText weight="600">Continuar con Google</AppText>
            </View>
          </AppButton>
        </View>

        {/* ── Divider ── */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, dividerStyle]} />
          <AppText variant="smallParagraph" muted>
            o
          </AppText>
          <View style={[styles.dividerLine, dividerStyle]} />
        </View>

        {/* ── Guest Section ── */}
        <View style={styles.guestSection}>
          <AppText variant="smallParagraph" muted align="center">
            ¿Solo querés explorar?
          </AppText>
          <TouchableOpacity
            onPress={() => {
              console.log("Guest mode");
            }}
            activeOpacity={0.7}
          >
            <AppText variant="paragraph" color={theme.primary} weight="600">
              Ingresar como invitado
            </AppText>
          </TouchableOpacity>
        </View>

        {/* ── Footer Disclaimer ── */}
        <AppText
          variant="verySmall"
          muted
          align="center"
          style={styles.footer}
        >
          Al continuar, aceptás nuestros Términos y Política de Privacidad
        </AppText>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    borderRadius: 12,
    height: 48,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  guestSection: {
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
  },
  footer: {
    opacity: 0.7,
    paddingBottom: 20,
  },
});

export default React.memo(LoginForm);
