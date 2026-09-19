import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  ChevronLeft,
  Plus,
  MoreVertical,
  Star,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import {
  fetchPaths,
  fetchPathJob,
  updatePath,
  deletePath,
  restorePath,
} from "../../../../application/thunks/paths.thunks";
import {
  selectAllPaths,
  selectDeletedPaths,
} from "../../../../application/selectors/paths.selectors";
import { pendingJobStorage, type PendingJob } from "../../../../infrastructure/storage/async-storage";

import type { LearningPath } from "../../../../domain/entities/path.entity";
import type { ThemeColors } from "../../../../config/theme.config";
import { getPathProgressPercent } from "../../../utils/path-progress.utils";

type PendingBannerState =
  | { status: "generating"; job: PendingJob; progress: number; label: string }
  | { status: "ready"; pathId: string; topic: string }
  | { status: "failed"; topic: string }
  | null;

interface PathCardProps {
  path: LearningPath;
  theme: ThemeColors;
  onMenu: (pathId: string, title: string, status: string) => void;
  archived?: boolean;
  deleted?: boolean;
}

const PathCard = React.memo(({ path, theme, onMenu, archived = false, deleted = false }: PathCardProps) => {
  const progress = getPathProgressPercent(path);
  const dimmed = archived || deleted;
  return (
    <TouchableOpacity
      activeOpacity={deleted ? 1 : 0.7}
      onPress={
        deleted
          ? () => onMenu(path.id, path.title, path.status)
          : () => router.push({ pathname: "/(protected)/path-detail", params: { pathId: path.id } })
      }
      style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }, dimmed && s.cardArchived]}
    >
      <View style={s.cardTop}>
        <View style={s.cardInfo}>
          <AppText
            variant="smallSubtitle"
            weight="600"
            numberOfLines={1}
            color={dimmed ? theme.textMuted : theme.textPrimary}
          >
            {path.title}
          </AppText>
          {path.description ? (
            <AppText variant="verySmall" muted numberOfLines={1}>
              {path.description}
            </AppText>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onMenu(path.id, path.title, path.status);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <MoreVertical size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
      <ProgressBar progress={progress} variant="primary" size="small" />
      <View style={s.cardBottom}>
        <AppText variant="verySmall" muted>
          {path.completedChapterCount ?? 0}/{path.chapterCount} capítulos
        </AppText>
        <View style={s.xpRow}>
          <Star
            size={11}
            color={dimmed ? theme.textMuted : theme.success}
            fill={dimmed ? theme.textMuted : theme.success}
          />
          <AppText variant="verySmall" color={dimmed ? theme.textMuted : theme.success} weight="600">
            {" "}
            {path.earnedXp} XP
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const AllPaths = () => {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const paths = useAppSelector(selectAllPaths);
  const deletedPaths = useAppSelector(selectDeletedPaths);

  const [banner, setBanner] = useState<PendingBannerState>(null);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false);

  const activePaths = useMemo(() => paths.filter((p) => p.status !== "archived"), [paths]);
  const archivedPaths = useMemo(() => paths.filter((p) => p.status === "archived"), [paths]);
  const deletedIds = useMemo(() => new Set(deletedPaths.map((p) => p.id)), [deletedPaths]);

  const iconScale = useSharedValue(1);
  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 700 }), withTiming(1.0, { duration: 700 })),
      -1,
      false,
    );
  }, []);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));

  const checkPendingJob = useCallback(async () => {
    const stored = await pendingJobStorage.get();
    if (!stored) return;

    // Job older than 15 min → consider stale
    if (Date.now() - stored.startedAt > 15 * 60 * 1000) {
      await pendingJobStorage.clear();
      return;
    }

    const result = await dispatch(fetchPathJob(stored.jobId));
    if (!fetchPathJob.fulfilled.match(result)) return;

    const job = result.payload;
    if (job.status === "completed") {
      await pendingJobStorage.clear();
      await dispatch(fetchPaths());
      setBanner({ status: "ready", pathId: job.pathId, topic: stored.topic });
    } else if (job.status === "failed") {
      await pendingJobStorage.clear();
      setBanner({ status: "failed", topic: stored.topic });
    } else {
      setBanner({
        status: "generating",
        job: stored,
        progress: job.progress ?? 0,
        label: job.progressLabel ?? "Generando ruta...",
      });
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPaths());
    checkPendingJob();
  }, [dispatch, checkPendingJob]);

  const handleMenu = (pathId: string, title: string, status: string) => {
    if (deletedIds.has(pathId)) {
      Alert.alert(
        title,
        "Esta ruta está en Eliminadas.",
        [
          { text: "Restaurar", onPress: () => dispatch(restorePath(pathId)) },
          { text: "Cancelar", style: "cancel" },
        ],
        { cancelable: true },
      );
      return;
    }

    Alert.alert(
      title,
      undefined,
      [
        {
          text: "Ver detalle",
          onPress: () => router.push({ pathname: "/(protected)/path-detail", params: { pathId } }),
        },
        status === "archived"
          ? { text: "Desarchivar", onPress: () => dispatch(updatePath({ id: pathId, status: "active" })) }
          : { text: "Archivar",    onPress: () => dispatch(updatePath({ id: pathId, status: "archived" })) },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            Alert.alert("Eliminar ruta", "Podrás recuperarla desde Eliminadas.", [
              { text: "Cancelar", style: "cancel" },
              { text: "Eliminar", style: "destructive", onPress: () => dispatch(deletePath(pathId)) },
            ]),
        },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          s.header,
          { paddingTop: insets.top + 12, backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <AppText variant="subtitle" weight="700" style={s.headerTitle}>
          Mis Rutas
        </AppText>
        <View style={[s.countBadge, { backgroundColor: theme.primaryLight }]}>
          <AppText variant="verySmall" color={theme.primary} weight="700">
            {activePaths.length}
          </AppText>
        </View>
      </View>

      {/* Pending job banner */}
      {banner?.status === "generating" && (
        <View style={[s.banner, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
          <Animated.View style={spinStyle}>
            <Sparkles size={16} color={theme.primary} />
          </Animated.View>
          <View style={s.bannerBody}>
            <AppText variant="verySmall" color={theme.primary} weight="700">
              Generando tu ruta...
            </AppText>
            <AppText variant="verySmall" color={theme.primary} numberOfLines={1}>
              {banner.job.topic}
            </AppText>
            <ProgressBar progress={banner.progress} variant="primary" size="small" />
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(protected)/path-generating",
                params: { topic: banner.job.topic, mode: banner.job.mode },
              })
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="verySmall" color={theme.primary} weight="700">
              Ver →
            </AppText>
          </TouchableOpacity>
        </View>
      )}
      {banner?.status === "ready" && (
        <TouchableOpacity
          style={[s.banner, { backgroundColor: "#DCFCE7", borderColor: theme.success }]}
          onPress={() => {
            setBanner(null);
            router.push({ pathname: "/(protected)/path-detail", params: { pathId: banner.pathId } });
          }}
        >
          <CheckCircle2 size={16} color={theme.success} />
          <View style={s.bannerBody}>
            <AppText variant="verySmall" color={theme.success} weight="700">
              ¡Ruta lista!
            </AppText>
            <AppText variant="verySmall" muted numberOfLines={1}>
              {banner.topic}
            </AppText>
          </View>
          <AppText variant="verySmall" color={theme.success} weight="700">
            Abrir →
          </AppText>
        </TouchableOpacity>
      )}
      {banner?.status === "failed" && (
        <View style={[s.banner, { backgroundColor: "#FEE2E2", borderColor: theme.danger }]}>
          <XCircle size={16} color={theme.danger} />
          <View style={s.bannerBody}>
            <AppText variant="verySmall" color={theme.danger} weight="700">
              Error al generar
            </AppText>
            <AppText variant="verySmall" muted numberOfLines={1}>
              {banner.topic}
            </AppText>
          </View>
          <TouchableOpacity onPress={() => setBanner(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <XCircle size={14} color={theme.danger} />
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.list}>
        {activePaths.length === 0 ? (
          <View style={[s.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <BookOpen size={36} color={theme.textMuted} />
            <AppText variant="subtitle" weight="600" align="center" style={s.emptyTitle}>
              Sin rutas aún
            </AppText>
            <AppText variant="smallParagraph" muted align="center">
              Crea tu primera ruta desde la pestaña Ruta
            </AppText>
            <AppButton
              variant="primary"
              style={s.emptyBtn}
              onPress={() => router.navigate("/(protected)/(tabs)/learning-path")}
            >
              <AppText color="#fff" weight="600">
                Crear mi primera ruta
              </AppText>
            </AppButton>
          </View>
        ) : (
          activePaths.map((path) => <PathCard key={path.id} path={path} theme={theme} onMenu={handleMenu} />)
        )}

        {archivedPaths.length > 0 && (
          <>
            <TouchableOpacity
              style={[s.archivedToggle, { borderColor: theme.border }]}
              onPress={() => setArchivedOpen((v) => !v)}
              activeOpacity={0.7}
            >
              <Archive size={14} color={theme.textMuted} />
              <AppText variant="verySmall" muted weight="600">
                Archivadas ({archivedPaths.length})
              </AppText>
              <ChevronLeft
                size={14}
                color={theme.textMuted}
                style={{ transform: [{ rotate: archivedOpen ? "90deg" : "-90deg" }], marginLeft: "auto" }}
              />
            </TouchableOpacity>
            {archivedOpen &&
              archivedPaths.map((path) => (
                <PathCard key={path.id} path={path} theme={theme} onMenu={handleMenu} archived />
              ))}
          </>
        )}

        {deletedPaths.length > 0 && (
          <>
            <TouchableOpacity
              style={[s.archivedToggle, { borderColor: theme.border }]}
              onPress={() => setDeletedOpen((v) => !v)}
              activeOpacity={0.7}
            >
              <Trash2 size={14} color={theme.textMuted} />
              <AppText variant="verySmall" muted weight="600">
                Eliminadas ({deletedPaths.length})
              </AppText>
              <ChevronLeft
                size={14}
                color={theme.textMuted}
                style={{ transform: [{ rotate: deletedOpen ? "90deg" : "-90deg" }], marginLeft: "auto" }}
              />
            </TouchableOpacity>
            {deletedOpen &&
              deletedPaths.map((path) => (
                <PathCard key={path.id} path={path} theme={theme} onMenu={handleMenu} deleted />
              ))}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, { backgroundColor: theme.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push("/(protected)/(tabs)/learning-path")}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bannerBody: { flex: 1, gap: 3 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: { flex: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  list: { padding: 20, paddingBottom: 100, gap: 10 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: {},
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpRow: { flexDirection: "row", alignItems: "center" },
  empty: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { marginTop: 4 },
  emptyBtn: { marginTop: 8, borderRadius: 14, paddingHorizontal: 24 },
  cardArchived: { opacity: 0.6 },
  archivedToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default React.memo(AllPaths);
