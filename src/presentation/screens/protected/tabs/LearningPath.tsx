import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import type { ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
import { Route, Sparkles, CheckCircle2, AlertCircle } from "lucide-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useMockLearningPath } from "../../../../shared/hooks/useMockLearningPath";
import type { PathStep } from "../../../../shared/hooks/useMockLearningPath";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import AppInput from "../../../components/ui/inputs/AppInput";
import GlassCard from "../../../components/ui/cards/GlassCard";

const STAGGER_DELAY = 100;

interface StepItemProps {
  step: PathStep;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
  totalSteps: number;
}

const StepItem: React.FC<StepItemProps> = ({ step, index, isCompleted, onToggle, totalSteps }) => {
  const theme = useThemeColors();
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  React.useEffect(() => {
    opacity.value = withDelay(index * STAGGER_DELAY, withTiming(1, { duration: 350 }));
    translateX.value = withDelay(index * STAGGER_DELAY, withTiming(0, { duration: 350 }));
  }, [index, opacity, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const circleStyle = useMemo<ViewStyle>(
    () => ({
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      ...(isCompleted
        ? { backgroundColor: theme.success }
        : {
            backgroundColor: theme.surface,
            borderWidth: 2,
            borderColor: theme.border,
          }),
    }),
    [isCompleted, theme.success, theme.surface, theme.border],
  );

  const activityBoxStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.primaryLight,
      borderColor: `${theme.primary}20`,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
      flexDirection: "row",
      alignItems: "flex-start",
    }),
    [theme.primaryLight, theme.primary],
  );

  return (
    <Animated.View style={[styles.stepRow, animatedStyle]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={circleStyle}>
        {isCompleted ? (
          <CheckCircle2 size={22} color="white" />
        ) : (
          <AppText variant="subtitle" muted weight="600">
            {index + 1}
          </AppText>
        )}
      </TouchableOpacity>

      <GlassCard variant="default" padding={16} style={styles.stepCard}>
        <AppText variant="subtitle" weight="600">
          {step.title}
        </AppText>
        <AppText variant="smallParagraph" muted style={styles.stepDescription}>
          {step.description}
        </AppText>

        <View style={[activityBoxStyle, styles.activityBox]}>
          <AlertCircle size={18} color={theme.primary} style={styles.activityIcon} />
          <View style={styles.activityTextColumn}>
            <AppText variant="verySmall" color={theme.primary} weight="bold" style={styles.activityLabel}>
              ACTIVIDAD PRÁCTICA
            </AppText>
            <AppText variant="smallParagraph" style={styles.activityText}>
              {step.activity}
            </AppText>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const LearningPath: React.FC = () => {
  const theme = useThemeColors();
  const { path, isLoading, generate } = useMockLearningPath();
  const [topic, setTopic] = useState("");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    if (topic.trim().length === 0) return;
    setCompletedSteps([]);
    setHasGenerated(true);
    generate(topic);
  }, [topic, generate]);

  const handleToggleStep = useCallback((stepId: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      }
      return [...prev, stepId];
    });
  }, []);

  const handleReset = useCallback(() => {
    setTopic("");
    setCompletedSteps([]);
    setHasGenerated(false);
  }, []);

  const showEmpty = !hasGenerated || path === null;

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

  const timelineLineStyle = useMemo<ViewStyle>(
    () => ({
      position: "absolute",
      left: 23,
      top: 16,
      bottom: 16,
      width: 2,
      backgroundColor: theme.border,
    }),
    [theme.border],
  );

  const resetButtonStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: `${theme.primary}20`,
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
          <View style={[styles.headerIconBox, { backgroundColor: theme.primaryLight }]}>
            <Route size={26} color={theme.primary} />
          </View>
          <AppText variant="title" style={styles.headerTitle}>
            Rutas de Aprendizaje
          </AppText>
        </View>
        <AppText variant="paragraph" muted style={styles.headerSubtitle}>
          Crea un camino personalizado para dominar cualquier tema.
        </AppText>

        {/* Empty State */}
        {showEmpty && (
          <GlassCard padding={22}>
            <View style={[infoBoxStyle, styles.infoBox]}>
              <Sparkles size={20} color={theme.primary} style={styles.infoIcon} />
              <AppText variant="smallParagraph" style={styles.infoText}>
                Nuestra IA analizará la complejidad del tema y diseñará una ruta que fomenta el análisis profundo antes
                de la práctica.
              </AppText>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputField}>
                <AppInput
                  placeholder="Ej: Mecánica Cuántica, Historia del Arte..."
                  value={topic}
                  onChangeText={setTopic}
                  editable={!isLoading}
                />
              </View>
              <AppButton variant="primary" onPress={handleGenerate} loading={isLoading}>
                <AppText color="#FFFFFF">Trazar</AppText>
              </AppButton>
            </View>
          </GlassCard>
        )}

        {/* Generated State */}
        {!showEmpty && path !== null && (
          <View style={styles.generatedSection}>
            <View
              style={[styles.pathBanner, { backgroundColor: theme.primaryLight, borderColor: `${theme.primary}18` }]}
            >
              <View style={styles.pathHeaderRow}>
                <AppText variant="title" style={styles.pathTitle}>
                  {path.title}
                </AppText>
                <TouchableOpacity onPress={handleReset} style={resetButtonStyle} activeOpacity={0.6}>
                  <AppText variant="smallParagraph" color={theme.primary} weight="600">
                    Nueva
                  </AppText>
                </TouchableOpacity>
              </View>
              <AppText variant="smallParagraph" muted style={styles.pathDescription}>
                {path.description}
              </AppText>
            </View>

            {/* Steps Timeline */}
            <View style={styles.timeline}>
              <View style={timelineLineStyle} />
              {path.steps.map((step, idx) => (
                <StepItem
                  key={step.id}
                  step={step}
                  index={idx}
                  isCompleted={completedSteps.includes(step.id)}
                  onToggle={() => handleToggleStep(step.id)}
                  totalSteps={path.steps.length}
                />
              ))}
            </View>
          </View>
        )}
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
    marginBottom: 6,
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
  headerSubtitle: {
    marginBottom: 24,
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
  generatedSection: {
    marginTop: 0,
  },
  pathBanner: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  pathHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pathTitle: {
    flex: 1,
    marginRight: 12,
  },
  pathDescription: {
    marginTop: 4,
  },
  timeline: {
    position: "relative",
    paddingLeft: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  stepCard: {
    flex: 1,
    marginLeft: 12,
  },
  stepDescription: {
    marginTop: 6,
  },
  activityBox: {
    marginTop: 14,
  },
  activityIcon: {
    marginRight: 8,
    marginTop: 1,
    flexShrink: 0,
  },
  activityTextColumn: {
    flex: 1,
  },
  activityLabel: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  activityText: {
    fontStyle: "italic",
  },
});

export default React.memo(LearningPath);
