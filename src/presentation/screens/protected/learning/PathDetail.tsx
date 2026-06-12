import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ChevronLeft, Star, Lock, CheckCircle2, CirclePlay, Download } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import type { Chapter } from "../../../../domain/entities/path.entity";
import AppText from "../../../components/ui/typography/AppText";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { fetchPathWithChapters, fetchChapterWithLessons } from "../../../../application/thunks/paths.thunks";
import { store } from "../../../../application/store/index";
import type { Lesson } from "../../../../domain/entities/path.entity";
import { selectPathById, selectChaptersByPathId } from "../../../../application/selectors/paths.selectors";
import { exportPathAsPdf } from "../../../../infrastructure/export/path-pdf";
import { getPathProgressPercent } from "../../../utils/path-progress.utils";

const NODE = 36;

interface ChapterRowProps {
  chapter: Chapter;
  index: number;
  pathId: string;
  isLast: boolean;
}

const ChapterRow: React.FC<ChapterRowProps> = ({ chapter, index, pathId, isLast }) => {
  const theme = useThemeColors();
  const isCurrent = chapter.status === "current";
  const isCompleted = chapter.status === "completed";
  const isLocked = chapter.status === "locked";

  const nodeBackground = isCompleted
    ? theme.success
    : isCurrent
      ? theme.primary
      : theme.border;

  const NodeIcon = isCompleted
    ? <CheckCircle2 size={18} color="#fff" />
    : isCurrent
      ? <CirclePlay size={18} color="#fff" />
      : <Lock size={15} color={theme.textMuted} />;

  return (
    <TouchableOpacity
      activeOpacity={isLocked ? 1 : 0.7}
      onPress={() => {
        if (isLocked) return;
        router.push({
          pathname: "/(protected)/chapter-content",
          params: { pathId, chapterId: chapter.id },
        });
      }}
      style={s.row}
    >
      {/* Left: node + connector line */}
      <View style={s.nodeCol}>
        <View style={[s.node, { backgroundColor: nodeBackground }]}>
          {NodeIcon}
        </View>
        {!isLast && (
          <View style={[s.connector, { backgroundColor: isCompleted ? theme.success : theme.border }]} />
        )}
      </View>

      {/* Right: content */}
      <View style={[
        s.card,
        {
          backgroundColor: theme.surface,
          borderColor: isCurrent ? `${theme.primary}40` : theme.border,
          borderWidth: isCurrent ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}>
        <View style={s.cardTop}>
          <AppText
            variant="verySmall"
            color={isLocked ? theme.textMuted : theme.primary}
            weight="600"
          >
            Capítulo {index + 1}
          </AppText>
          {isCompleted && (
            <View style={[s.xpBadge, { backgroundColor: `${theme.success}18` }]}>
              <Star size={10} color={theme.success} fill={theme.success} />
              <AppText variant="verySmall" color={theme.success} weight="700">
                {" "}{chapter.earnedXp} XP
              </AppText>
            </View>
          )}
          {isCurrent && (
            <View style={[s.xpBadge, { backgroundColor: `${theme.primary}15` }]}>
              <AppText variant="verySmall" color={theme.primary} weight="700">
                AHORA
              </AppText>
            </View>
          )}
        </View>
        <AppText
          variant="paragraph"
          weight={isCurrent ? "600" : "normal"}
          color={isLocked ? theme.textMuted : theme.textPrimary}
          style={s.cardTitle}
        >
          {chapter.title}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const PathDetail = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { pathId } = useLocalSearchParams<{ pathId: string }>();

  const pathSelector = useMemo(() => selectPathById(pathId ?? ""), [pathId]);
  const chaptersSelector = useMemo(() => selectChaptersByPathId(pathId ?? ""), [pathId]);
  const path = useAppSelector(pathSelector);
  const chapters = useAppSelector(chaptersSelector);

  const [fetching, setFetching] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!path || exporting) return;
    setExporting(true);
    try {
      const lessonsByChapter: Record<string, Lesson[]> = {};
      const cachedLessons = store.getState().paths.lessons;
      for (const chapter of chapters) {
        const cached = cachedLessons[chapter.id];
        if (cached?.length) {
          lessonsByChapter[chapter.id] = cached;
          continue;
        }
        try {
          const result = await dispatch(
            fetchChapterWithLessons({ pathId: path.id, chapterId: chapter.id }),
          ).unwrap();
          lessonsByChapter[chapter.id] = result.lessons ?? [];
        } catch {
          lessonsByChapter[chapter.id] = [];
        }
      }
      await exportPathAsPdf({ path, chapters, lessonsByChapter });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (!pathId) { setFetching(false); return; }
    setFetching(true);
    dispatch(fetchPathWithChapters(pathId)).finally(() => setFetching(false));
  }, [dispatch, pathId]);

  if (fetching) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <AppText muted>Cargando ruta...</AppText>
      </View>
    );
  }

  if (!path) {
    return (
      <View style={[s.centered, { backgroundColor: theme.background }]}>
        <AppText muted>Ruta no encontrada.</AppText>
      </View>
    );
  }

  const progress = getPathProgressPercent(path, chapters);
  const completedCount = path.completedChapterCount ?? 0;
  const totalCount = path.chapterCount ?? chapters.length;

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerContent}>
          <AppText variant="subtitle" weight="700" numberOfLines={1} style={s.headerTitle}>
            {path.title}
          </AppText>
          <View style={s.headerMeta}>
            <AppText variant="verySmall" muted>
              {completedCount}/{totalCount} capítulos
            </AppText>
            <View style={[s.xpPill, { backgroundColor: `${theme.success}15` }]}>
              <Star size={11} color={theme.success} fill={theme.success} />
              <AppText variant="verySmall" color={theme.success} weight="700">
                {" "}{path.earnedXp} XP
              </AppText>
            </View>
          </View>
          <View style={s.progressRow}>
            <ProgressBar progress={progress} variant="primary" size="default" />
            <AppText variant="verySmall" color={theme.primary} weight="600" style={s.progressPct}>
              {progress}%
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleExportPdf}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={path.status === 'generating' || exporting}
        >
          <Download size={20} color={path.status === 'generating' || exporting ? theme.border : theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {chapters.map((chapter, idx) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            index={idx}
            pathId={path.id}
            isLast={idx === chapters.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: { flex: 1 },
  headerTitle: { marginBottom: 4 },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressPct: { minWidth: 32, textAlign: "right" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  row: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 0,
  },
  nodeCol: {
    alignItems: "center",
    width: NODE,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 16,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: { lineHeight: 20 },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});

export default React.memo(PathDetail);
