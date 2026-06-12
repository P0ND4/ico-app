import React, { useEffect, useMemo, useRef } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { GraduationCap, Star, CheckCircle2, Share2, BookOpen, Trophy, RotateCcw } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import { useAppSelector } from "../../../../application/store/hooks";
import { selectPathById, selectChaptersByPathId } from "../../../../application/selectors/paths.selectors";
import { useSoundEffect } from "../../../../infrastructure/sound/useSoundEffect";

interface ShareCardProps {
  title: string;
  xp: number;
  chapters: number;
  primary: string;
}

const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ title, xp, chapters, primary }, ref) => (
    <View ref={ref} style={sc.card} collapsable={false}>
      <LinearGradient
        colors={[primary, `${primary}CC`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={sc.gradient}
      >
        {/* Top badge */}
        <View style={sc.badge}>
          <GraduationCap size={16} color={primary} />
          <AppText variant="verySmall" color={primary} weight="700">ICO · Ruta completada</AppText>
        </View>

        {/* Title */}
        <AppText variant="subtitle" weight="700" color="#fff" style={sc.title} numberOfLines={2}>
          {title}
        </AppText>

        {/* Stats */}
        <View style={sc.stats}>
          <View style={sc.stat}>
            <View style={sc.statIcon}>
              <Star size={14} color="#fff" fill="#fff" />
            </View>
            <AppText variant="smallTitle" weight="700" color="#fff">{xp}</AppText>
            <AppText variant="verySmall" color="rgba(255,255,255,0.75)">XP</AppText>
          </View>
          <View style={sc.statDivider} />
          <View style={sc.stat}>
            <View style={sc.statIcon}>
              <BookOpen size={14} color="#fff" />
            </View>
            <AppText variant="smallTitle" weight="700" color="#fff">{chapters}</AppText>
            <AppText variant="verySmall" color="rgba(255,255,255,0.75)">Capítulos</AppText>
          </View>
          <View style={sc.statDivider} />
          <View style={sc.stat}>
            <View style={sc.statIcon}>
              <Trophy size={14} color="#fff" />
            </View>
            <AppText variant="smallTitle" weight="700" color="#fff">100%</AppText>
            <AppText variant="verySmall" color="rgba(255,255,255,0.75)">Completado</AppText>
          </View>
        </View>
      </LinearGradient>
    </View>
  ),
);

const PathComplete = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const cardRef = useRef<View>(null);

  const pathSelector = useMemo(() => selectPathById(pathId ?? ""), [pathId]);
  const chaptersSelector = useMemo(() => selectChaptersByPathId(pathId ?? ""), [pathId]);
  const path = useAppSelector(pathSelector);
  const chapters = useAppSelector(chaptersSelector);

  const { play } = useSoundEffect();
  const iconScale = useSharedValue(0);
  const contentY = useSharedValue(24);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }));
    contentY.value = withDelay(300, withSpring(0, { damping: 16, stiffness: 160 }));
    contentOpacity.value = withDelay(300, withSpring(1, { damping: 20, stiffness: 200 }));
    play('completedCourse');
  }, [play]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }));

  const completedChapters = chapters.filter((c) => c.status === "completed").length;
  const totalXp = path?.earnedXp ?? 0;

  const handleShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Compartir logro" });
      }
    } catch { /* user dismissed */ }
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      {/* Hidden share card rendered off-screen for capture */}
      <View style={s.offscreen} pointerEvents="none">
        <ShareCard
          ref={cardRef}
          title={path?.title ?? ""}
          xp={totalXp}
          chapters={completedChapters}
          primary={theme.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Animated.View style={[s.iconWrap, iconStyle]}>
          <View style={[s.iconCircle, { backgroundColor: theme.primary }]}>
            <GraduationCap size={40} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={[s.body, contentStyle]}>
          {/* Title */}
          <AppText variant="bigTitle" align="center" style={s.title}>
            ¡Ruta completada!
          </AppText>
          {path?.title ? (
            <AppText variant="paragraph" muted align="center" style={s.pathTitle}>
              {path.title}
            </AppText>
          ) : null}

          {/* Stats row */}
          <View style={[s.statsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={s.stat}>
              <AppText variant="smallTitle" weight="700">{completedChapters}</AppText>
              <AppText variant="verySmall" muted>Capítulos</AppText>
            </View>
            <View style={[s.statDivider, { backgroundColor: theme.border }]} />
            <View style={s.stat}>
              <View style={s.xpRow}>
                <Star size={14} color={theme.success} fill={theme.success} />
                <AppText variant="smallTitle" weight="700" color={theme.success}> {totalXp}</AppText>
              </View>
              <AppText variant="verySmall" muted>XP Total</AppText>
            </View>
            <View style={[s.statDivider, { backgroundColor: theme.border }]} />
            <View style={s.stat}>
              <AppText variant="smallTitle" weight="700">{chapters.length}</AppText>
              <AppText variant="verySmall" muted>Lecciones</AppText>
            </View>
          </View>

          {/* Chapter list */}
          <View style={[s.chapterList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <AppText variant="verySmall" color={theme.primary} weight="700" style={s.listLabel}>
              CAPÍTULOS COMPLETADOS
            </AppText>
            {chapters.map((ch, i) => (
              <View
                key={ch.id}
                style={[s.chapterRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}
              >
                <CheckCircle2 size={15} color={theme.success} />
                <AppText variant="smallParagraph" style={s.chapterName} numberOfLines={1}>
                  {ch.title}
                </AppText>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={s.btns}>
            <AppButton variant="outline" widthFull onPress={handleShare}>
              <View style={s.btnInner}>
                <Share2 size={15} color={theme.primary} />
                <AppText color={theme.primary} weight="600"> Compartir progreso</AppText>
              </View>
            </AppButton>
            {chapters.length > 0 && (
              <AppButton
                variant="outline"
                widthFull
                onPress={() => {
                  const firstChapter = chapters.find((c) => (c as { order?: number }).order === 0) ?? chapters[0];
                  if (firstChapter) {
                    router.replace({
                      pathname: "/(protected)/chapter-content",
                      params: { pathId: pathId ?? "", chapterId: firstChapter.id },
                    });
                  }
                }}
              >
                <View style={s.btnInner}>
                  <RotateCcw size={15} color={theme.textMuted} />
                  <AppText color={theme.textMuted} weight="600"> Repetir evaluación</AppText>
                </View>
              </AppButton>
            )}
            <AppButton
              variant="primary"
              widthFull
              onPress={() => router.replace("/(protected)/(tabs)/home")}
            >
              <AppText color="#fff" weight="700">Volver al inicio</AppText>
            </AppButton>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  offscreen: { position: "absolute", top: -9999, left: 0 },
  scroll: { alignItems: "center", paddingHorizontal: 24 },
  iconWrap: { marginBottom: 24 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { width: "100%", alignItems: "center", gap: 16 },
  title: { marginBottom: 2 },
  pathTitle: { marginTop: -8 },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth },
  xpRow: { flexDirection: "row", alignItems: "center" },
  chapterList: {
    width: "100%",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  listLabel: { marginBottom: 12, letterSpacing: 0.5 },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  chapterName: { flex: 1 },
  btns: { width: "100%", gap: 10, marginTop: 8 },
  btnInner: { flexDirection: "row", alignItems: "center" },
});

// ShareCard styles
const sc = StyleSheet.create({
  card: { width: 360, borderRadius: 20, overflow: "hidden" },
  gradient: { padding: 24, gap: 16 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  title: { lineHeight: 26 },
  stats: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statIcon: { marginBottom: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
});

export default React.memo(PathComplete);
