import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import type { ViewStyle } from "react-native";
import { Route, Sparkles, AlertCircle } from "lucide-react-native";
import { router } from "expo-router";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import AppInput from "../../../components/ui/inputs/AppInput";
import AppSegmentedPicker from "../../../components/ui/buttons/AppSegmentedPicker";
import GlassCard from "../../../components/ui/cards/GlassCard";

import { useAppSelector } from "../../../../application/store/hooks";
import {
  selectTrialExhausted,
  selectCanGenerateStandardPath,
  selectCanGenerateDeepPath,
  selectTrialStandardPathLabel,
  selectTrialDeepPathLabel,
  selectIsOnActiveTrial,
  selectStandardPathLimit,
  selectDeepPathLimit,
} from "../../../../application/selectors/user.selectors";
import { showPaywallModal, showPremiumFeatureAlert } from "../../../../infrastructure/api/plan-error.utils";

const PICKER_OPTIONS = [
  { label: "Estándar", value: "trazo" },
  { label: "Profundo", value: "deep" },
];

const LearningPath: React.FC = () => {
  const theme = useThemeColors();
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<string>("trazo");
  const trialExhausted = useAppSelector(selectTrialExhausted);
  const canGenerateStandard = useAppSelector(selectCanGenerateStandardPath);
  const canGenerateDeep = useAppSelector(selectCanGenerateDeepPath);
  const trialStandardPathLabel = useAppSelector(selectTrialStandardPathLabel);
  const trialDeepPathLabel = useAppSelector(selectTrialDeepPathLabel);
  const isOnActiveTrial = useAppSelector(selectIsOnActiveTrial);
  const standardPathLimit = useAppSelector(selectStandardPathLimit);
  const deepPathLimit = useAppSelector(selectDeepPathLimit);

  const isDeepMode = mode === "deep";
  const canGenerate = isDeepMode ? canGenerateDeep : canGenerateStandard;
  const trialPathLabel = isDeepMode ? trialDeepPathLabel : trialStandardPathLabel;

  const pathAlertOptions = trialExhausted
    ? { reason: 'device_blocked' as const }
    : isDeepMode
      ? { reason: 'deep_path_quota' as const, deepPathLimit }
      : { reason: 'standard_path_quota' as const, standardPathLimit };

  const handleGenerate = useCallback(() => {
    if (topic.trim().length === 0) return;
    if (trialExhausted) {
      showPaywallModal('El acceso gratuito en este dispositivo');
      return;
    }
    if (!canGenerate) {
      showPremiumFeatureAlert(
        isDeepMode ? 'las rutas profundas' : 'las rutas estándar',
        pathAlertOptions,
      );
      return;
    }
    const trimmed = topic.trim();
    setTopic("");
    router.push({
      pathname: "/(protected)/path-generating",
      params: { topic: trimmed, mode },
    });
  }, [topic, mode, trialExhausted, canGenerate, isDeepMode, pathAlertOptions]);

  const infoBoxStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.primaryLight,
      borderColor: `${theme.primary}20`,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
    }),
    [theme.primaryLight, theme.primary],
  );

  return (
    <AppContainer style={{ padding: 0 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.headerIconBox,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Route size={26} color={theme.primary} />
          </View>
          <AppText variant="title" style={styles.headerTitle}>
            Rutas de Aprendizaje
          </AppText>
        </View>

        <AppSegmentedPicker
          options={PICKER_OPTIONS}
          selectedValue={mode}
          onSelect={setMode}
          style={styles.modePicker}
        />

        <AppText variant="paragraph" muted style={styles.headerSubtitle}>
          Crea un camino personalizado para dominar cualquier tema.
        </AppText>

        {isOnActiveTrial && canGenerate && trialPathLabel && (
          <View style={[styles.trialInfoBanner, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }]}>
            <AlertCircle size={14} color={theme.primary} />
            <AppText variant="verySmall" color={theme.primary} weight="600" style={styles.trialBannerText}>
              {`Tu plan: ${trialPathLabel}`}
            </AppText>
          </View>
        )}

        {!canGenerate && !trialExhausted && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => showPremiumFeatureAlert(
              isDeepMode ? 'las rutas profundas' : 'las rutas estándar',
              pathAlertOptions,
            )}
            style={[styles.premiumBanner, { backgroundColor: `${theme.primary}14`, borderColor: `${theme.primary}40` }]}
          >
            <AlertCircle size={14} color={theme.primary} />
            <AppText variant="verySmall" color={theme.primary} weight="600" style={styles.trialBannerText}>
              {isDeepMode
                ? 'Agotaste tus rutas profundas gratuitas'
                : 'Agotaste tus rutas estándar gratuitas'}
            </AppText>
          </TouchableOpacity>
        )}

        {/* Input Card */}
        <GlassCard padding={22}>
          <AppText
            variant="subtitle"
            weight="600"
            style={styles.emptyCardTitle}
          >
            ¿Qué querés aprender?
          </AppText>

          <View style={[infoBoxStyle, styles.infoBox]}>
            <Sparkles
              size={18}
              color={theme.primary}
              style={styles.infoIcon}
            />
            <AppText variant="smallParagraph" style={styles.infoText}>
              La IA analiza la complejidad del tema y diseña una ruta que
              fomenta el análisis profundo antes de la práctica.
            </AppText>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputField}>
              <AppInput
                placeholder="Ej: Mecánica Cuántica, Historia del Arte..."
                value={topic}
                onChangeText={setTopic}
              />
            </View>
            <AppButton variant="primary" onPress={handleGenerate}>
              <AppText color="#FFFFFF">Generar</AppText>
            </AppButton>
          </View>
        </GlassCard>

        {/* Ver todas link */}
        <TouchableOpacity
          onPress={() => router.push("/(protected)/all-paths")}
          style={styles.viewAllLink}
          activeOpacity={0.7}
        >
          <AppText
            variant="smallParagraph"
            color={theme.primary}
            weight="600"
          >
            {"Ver todas las rutas →"}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
  },
  modePicker: {
    marginBottom: 20,
  },
  headerSubtitle: {
    marginBottom: 24,
  },
  trialInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  trialBannerText: {
    flex: 1,
  },
  emptyCardTitle: {
    marginBottom: 16,
  },
  infoBox: {
    marginBottom: 18,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputField: {
    flex: 1,
  },
  viewAllLink: {
    alignSelf: "center",
    marginTop: 16,
    padding: 8,
  },
});

export default React.memo(LearningPath);
