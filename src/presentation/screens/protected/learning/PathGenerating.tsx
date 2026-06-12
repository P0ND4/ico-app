import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, AppState, type AppStateStatus } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Sparkles, Info } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { showPlanLimitAlert } from "../../../../infrastructure/api/plan-error.utils";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../../../components/ui/typography/AppText";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useAppDispatch } from "../../../../application/store/hooks";
import { generatePath, fetchPathJob } from "../../../../application/thunks/paths.thunks";
import { pendingJobStorage } from "../../../../infrastructure/storage/async-storage";
import { useSoundEffect } from "../../../../infrastructure/sound/useSoundEffect";
import type { PathMode } from "../../../../domain/entities/path.entity";

const POLL_INTERVAL = 4000;

const PathGenerating = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const { play } = useSoundEffect();
  const { topic, mode } = useLocalSearchParams<{ topic: string; mode?: string }>();

  const [progress, setProgress] = useState(3);
  const [label, setLabel] = useState("Iniciando generación...");
  const [failed, setFailed] = useState(false);

  const hasDispatched = useRef(false);
  const hasNavigated = useRef(false);
  const jobIdRef = useRef<string | null>(null);
  const pathIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedMode: PathMode = mode === "deep" ? "deep" : "standard";

  const iconScale = useSharedValue(1);
  const iconOpacity = useSharedValue(1);

  useEffect(() => {
    iconScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    iconOpacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 900 }), withTiming(1.0, { duration: 900 })),
      -1,
      false,
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const navigateTo = (pathId: string) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    stopPolling();
    pendingJobStorage.clear();
    setProgress(100);
    play('generated');
    router.replace({ pathname: "/(protected)/path-detail", params: { pathId } });
  };

  const poll = async () => {
    const jobId = jobIdRef.current;
    if (!jobId || hasNavigated.current) return;

    const result = await dispatch(fetchPathJob(jobId));
    if (!fetchPathJob.fulfilled.match(result)) return;

    const job = result.payload;
    if (typeof job.progress === "number") setProgress(Math.max(3, Math.min(99, job.progress)));
    if (job.progressLabel) setLabel(job.progressLabel);

    if (job.status === "completed") {
      navigateTo(job.pathId);
    } else if (job.status === "failed") {
      stopPolling();
      pendingJobStorage.clear();
      setFailed(true);
      setLabel("Error al generar la ruta. Intentá de nuevo.");
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
  };

  // Pause polling when app goes to background (saves battery/requests)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") startPolling();
      else stopPolling();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (hasDispatched.current) return;
    hasDispatched.current = true;

    dispatch(generatePath({ topic: topic ?? "", mode: resolvedMode })).then(async (result) => {
      if (generatePath.rejected.match(result)) {
        showPlanLimitAlert(result.payload, "generar rutas");
        router.back();
        return;
      }
      if (!generatePath.fulfilled.match(result)) return;

      const { status, pathId, jobId } = result.payload;

      if (status === "completed") {
        navigateTo(pathId);
        return;
      }

      jobIdRef.current = jobId;
      pathIdRef.current = pathId;

      // Persist so the user can close the app and come back
      await pendingJobStorage.save({
        jobId,
        pathId,
        topic: topic ?? "",
        mode: resolvedMode,
        startedAt: Date.now(),
      });

      // Immediate check, then start interval
      await poll();
      startPolling();
    });

    return stopPolling;
  }, []);

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <View style={s.center}>
        {/* Pulsing icon */}
        <Animated.View style={[s.iconBox, { backgroundColor: theme.primaryLight }, iconStyle]}>
          <Sparkles size={32} color={theme.primary} />
        </Animated.View>

        {/* Topic pill */}
        <View style={[s.topicPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="verySmall" color={theme.primary} weight="600" numberOfLines={2} align="center">
            {topic}
          </AppText>
        </View>

        {/* Status label */}
        <AppText variant="subtitle" weight="600" align="center" style={s.phaseText}>
          {label}
        </AppText>

        {/* Progress bar */}
        {!failed && (
          <View style={s.progressWrap}>
            <ProgressBar progress={progress} variant="primary" size="default" />
            <AppText variant="verySmall" color={theme.primary} weight="600" style={s.progressPct}>
              {progress}%
            </AppText>
          </View>
        )}

        {/* "You can close the app" hint */}
        {!failed && (
          <View style={[s.hintBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Info size={14} color={theme.textMuted} />
            <AppText variant="verySmall" muted style={s.hintText}>
              Podés cerrar la app. Tu curso seguirá generándose y lo encontrarás listo en{" "}
              <AppText variant="verySmall" color={theme.primary} weight="600">Mis Rutas</AppText>
              {" "}cuando vuelvas.
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  topicPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: "90%",
  },
  phaseText: { marginTop: 4 },
  progressWrap: {
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  progressPct: { textAlign: "right" },
  hintBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginTop: 8,
    width: "100%",
  },
  hintText: { flex: 1, lineHeight: 18 },
});

export default React.memo(PathGenerating);
