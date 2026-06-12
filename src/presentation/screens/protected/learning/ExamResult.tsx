import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, XCircle, ThumbsUp, AlertCircle, Lightbulb } from "lucide-react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import { useAppDispatch } from "../../../../application/store/hooks";
import { completeChapter } from "../../../../application/thunks/paths.thunks";

const ExamResult = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {
    score: scoreParam,
    passed: passedParam,
    strengths: strengthsParam,
    weaknesses: weaknessesParam,
    recommendations: recommendationsParam,
    pathId,
    chapterId,
    earnedPoints,
  } = useLocalSearchParams<{
    score: string;
    passed: string;
    strengths: string;
    weaknesses: string;
    recommendations: string;
    pathId: string;
    chapterId: string;
    earnedPoints: string;
  }>();

  const score = parseInt(scoreParam ?? "0", 10);
  const passed = passedParam === "true";
  const strengths: string[] = strengthsParam ? JSON.parse(strengthsParam) : [];
  const weaknesses: string[] = weaknessesParam ? JSON.parse(weaknessesParam) : [];
  const recommendations: string[] = recommendationsParam ? JSON.parse(recommendationsParam) : [];

  const dispatch = useAppDispatch();
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }));
    contentOpacity.value = withDelay(300, withSpring(1, { damping: 20 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const scoreColor = passed ? theme.success : score >= 50 ? theme.accent : theme.danger;

  return (
    <View style={[s.screen, { backgroundColor: theme.background, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Score icon */}
        <Animated.View style={[s.iconWrap, iconStyle]}>
          <View style={[s.iconCircle, { backgroundColor: scoreColor }]}>
            {passed
              ? <CheckCircle2 size={36} color="#fff" />
              : <XCircle size={36} color="#fff" />
            }
          </View>
        </Animated.View>

        <Animated.View style={[s.body, contentStyle]}>
          {/* Score */}
          <AppText variant="bigTitle" align="center" color={scoreColor}>
            {score}/100
          </AppText>
          <AppText variant="paragraph" muted align="center" style={s.mt4}>
            {passed ? "¡Aprobado! Podés continuar." : "No alcanzaste el mínimo (70/100)."}
          </AppText>

          {/* Strengths */}
          {strengths.length > 0 && (
            <View style={[s.card, { backgroundColor: `${theme.success}10`, borderColor: `${theme.success}30` }]}>
              <View style={s.cardHeader}>
                <ThumbsUp size={15} color={theme.success} />
                <AppText variant="verySmall" color={theme.success} weight="700"> Fortalezas</AppText>
              </View>
              {strengths.map((s_, i) => (
                <AppText key={i} variant="smallParagraph" style={s.listItem}>• {s_}</AppText>
              ))}
            </View>
          )}

          {/* Weaknesses */}
          {weaknesses.length > 0 && (
            <View style={[s.card, { backgroundColor: `${theme.danger}10`, borderColor: `${theme.danger}30` }]}>
              <View style={s.cardHeader}>
                <AlertCircle size={15} color={theme.danger} />
                <AppText variant="verySmall" color={theme.danger} weight="700"> Áreas a mejorar</AppText>
              </View>
              {weaknesses.map((w, i) => (
                <AppText key={i} variant="smallParagraph" style={s.listItem}>• {w}</AppText>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={[s.card, { backgroundColor: `${theme.primary}10`, borderColor: `${theme.primary}30` }]}>
              <View style={s.cardHeader}>
                <Lightbulb size={15} color={theme.primary} />
                <AppText variant="verySmall" color={theme.primary} weight="700"> Recomendaciones</AppText>
              </View>
              {recommendations.map((r, i) => (
                <AppText key={i} variant="smallParagraph" style={s.listItem}>• {r}</AppText>
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={s.btns}>
            {!passed && (
              <AppButton
                variant="outline"
                widthFull
                onPress={() => router.back()}
              >
                <AppText color={theme.primary} weight="600">Reintentar examen</AppText>
              </AppButton>
            )}
            {passed ? (
              <AppButton
                variant="primary"
                widthFull
                onPress={async () => {
                  const pts = parseInt(earnedPoints ?? "0", 10);
                  let pathCompleted = false;
                  try {
                    const result = await dispatch(completeChapter({
                      pathId: pathId ?? "",
                      chapterId: chapterId ?? "",
                      earnedXp: pts,
                      correctCount: 0,
                      totalQuestions: 0,
                    })).unwrap();
                    pathCompleted = (result as { pathCompleted?: boolean }).pathCompleted ?? false;
                  } catch { /* proceed regardless */ }
                  router.replace({
                    pathname: "/(protected)/chapter-complete",
                    params: { pathId, chapterId, earnedPoints: earnedPoints ?? "0", pathCompleted: String(pathCompleted) },
                  });
                }}
              >
                <AppText color="#fff" weight="700">Continuar</AppText>
              </AppButton>
            ) : (
              <AppButton
                variant="outline"
                widthFull
                onPress={() => router.replace("/(protected)/(tabs)/home")}
              >
                <AppText color={theme.textMuted} weight="600">Ir al inicio</AppText>
              </AppButton>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24 },
  scroll: { alignItems: "center" },
  iconWrap: { marginBottom: 20 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { width: "100%", alignItems: "center", gap: 16 },
  mt4: { marginTop: -8 },
  card: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  listItem: { lineHeight: 20 },
  btns: { width: "100%", gap: 10, marginTop: 8 },
});

export default React.memo(ExamResult);
