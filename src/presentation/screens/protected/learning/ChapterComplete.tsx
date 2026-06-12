import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Star } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { selectChaptersByPathId } from "../../../../application/selectors/paths.selectors";
import { fetchProfile } from "../../../../application/thunks/user.thunks";
import { useSoundEffect } from "../../../../infrastructure/sound/useSoundEffect";

const ChapterComplete = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { play } = useSoundEffect();
  const {
    pathId, chapterId, earnedPoints, correctCount,
    totalQuestions, totalLessons, chapterTitle, pathCompleted,
  } = useLocalSearchParams<{
    pathId: string; chapterId: string; earnedPoints: string;
    correctCount: string; totalQuestions: string; totalLessons: string;
    chapterTitle: string; pathCompleted: string;
  }>();

  const chaptersSelector = useMemo(() => selectChaptersByPathId(pathId ?? ""), [pathId]);
  const chapters = useAppSelector(chaptersSelector);

  useEffect(() => {
    dispatch(fetchProfile());
    play('completedChapter');
  }, [dispatch, play]);

  const pts = parseInt(earnedPoints ?? "0", 10);
  const correct = parseInt(correctCount ?? "0", 10);
  const total = parseInt(totalQuestions ?? "0", 10);
  const lessons = parseInt(totalLessons ?? "0", 10);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const starCount = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

  const star1 = useSharedValue(0);
  const star2 = useSharedValue(0);
  const star3 = useSharedValue(0);
  const bodyOpacity = useSharedValue(0);
  const bodyY = useSharedValue(20);

  useEffect(() => {
    const cfg = { damping: 12, stiffness: 200 };
    star1.value = withSpring(1, cfg);
    star2.value = withDelay(200, withSpring(1, cfg));
    star3.value = withDelay(400, withSpring(1, cfg));
    bodyOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    bodyY.value = withDelay(300, withSpring(0, { damping: 16, stiffness: 160 }));
  }, []);

  const starStyles = [
    useAnimatedStyle(() => ({ transform: [{ scale: star1.value }] })),
    useAnimatedStyle(() => ({ transform: [{ scale: star2.value }] })),
    useAnimatedStyle(() => ({ transform: [{ scale: star3.value }] })),
  ];
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: bodyY.value }],
  }));

  const accuracyColor = accuracy >= 80 ? theme.success : accuracy >= 50 ? theme.accent : theme.danger;

  const handleContinue = () => {
    if (pathCompleted === "true") {
      router.replace({ pathname: "/(protected)/path-complete", params: { pathId, earnedPoints } });
    } else {
      router.back();
    }
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
      {/* Stars */}
      <View style={s.starsRow}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={starStyles[i]}>
            <Star
              size={i === 1 ? 60 : 44}
              color={i < starCount ? "#F59E0B" : theme.border}
              fill={i < starCount ? "#F59E0B" : "transparent"}
            />
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[s.body, bodyStyle]}>
        {/* Title */}
        <AppText variant="bigTitle" align="center">{"¡Capítulo\ncompletado!"}</AppText>
        <View style={[s.xpBadge, { backgroundColor: theme.success }]}>
          <AppText variant="subtitle" color="#fff" weight="bold">+{pts} XP</AppText>
        </View>

        {/* Stats */}
        <View style={[s.stats, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={s.stat}>
            <AppText variant="smallTitle" weight="700" color={accuracyColor}>{accuracy}%</AppText>
            <AppText variant="verySmall" muted>Aciertos</AppText>
          </View>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <View style={s.stat}>
            <AppText variant="smallTitle" weight="700">{correct}/{total}</AppText>
            <AppText variant="verySmall" muted>Respuestas</AppText>
          </View>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <View style={s.stat}>
            <AppText variant="smallTitle" weight="700">{lessons}</AppText>
            <AppText variant="verySmall" muted>Lecciones</AppText>
          </View>
        </View>

        {/* Chapter label */}
        {chapterTitle ? (
          <View style={[s.chapterRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppText variant="verySmall" color={theme.primary} weight="700" style={s.chapterLabel}>
              MÓDULO COMPLETADO
            </AppText>
            <AppText variant="smallParagraph" style={s.chapterText}>
              {chapterTitle}
            </AppText>
          </View>
        ) : null}

        <AppButton variant="primary" widthFull style={s.btn} onPress={handleContinue}>
          <AppText color="#fff" weight="700" variant="smallSubtitle">Continuar</AppText>
        </AppButton>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    marginBottom: 28,
  },
  body: { width: "100%", alignItems: "center", gap: 16 },
  xpBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stats: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  divider: { width: StyleSheet.hairlineWidth },
  chapterRow: {
    width: "100%",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
  chapterLabel: { letterSpacing: 0.5 },
  chapterText: { lineHeight: 20 },
  btn: { borderRadius: 16, height: 52, marginTop: 4 },
});

export default React.memo(ChapterComplete);
