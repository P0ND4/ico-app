import React, { useMemo, useRef } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  BookOpen,
  Target,
  GraduationCap,
  UserCircle,
  Crown,
  Gem,
  Zap,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import GlassCard from "../../../components/ui/cards/GlassCard";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { fetchPaths } from "../../../../application/thunks/paths.thunks";
import { fetchProfile, fetchStats } from "../../../../application/thunks/user.thunks";
import { selectActivePaths, selectCompletedPaths } from "../../../../application/selectors/paths.selectors";
import { selectUserProfile, selectUserStats, selectShowAds, selectUserBadge, selectTrialExhausted } from "../../../../application/selectors/user.selectors";
import { selectIsGuest } from "../../../../application/selectors/auth.selectors";
import { useInterstitialAd } from "../../../hooks/useInterstitialAd";
import { showPaywallModal } from "../../../../infrastructure/api/plan-error.utils";
import { getPathProgressPercent } from "../../../utils/path-progress.utils";
import HomeQuotaStatus from "../../../components/ui/subscription/HomeQuotaStatus";


interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconBg: string;
  color: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

const Home = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const greeting = getGreeting();

  const paths = useAppSelector(selectActivePaths);
  const completedPaths = useAppSelector(selectCompletedPaths);
  const userProfile = useAppSelector(selectUserProfile);
  const userStats = useAppSelector(selectUserStats);
  const isGuest = useAppSelector(selectIsGuest);
  const showAds = useAppSelector(selectShowAds);
  const userBadge = useAppSelector(selectUserBadge);
  const trialExhausted = useAppSelector(selectTrialExhausted);

  useInterstitialAd(!showAds);

  const isFirstFocus = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      dispatch(fetchPaths());
      dispatch(fetchProfile());
      dispatch(fetchStats());
    }, [dispatch]),
  );

  const avgProgress = useMemo(() => {
    if (paths.length === 0) return 0;
    return Math.round(
      paths.reduce((sum, p) => {
        const progress = getPathProgressPercent(p);
        return sum + progress;
      }, 0) / paths.length,
    );
  }, [paths]);

  const totalXP = userProfile?.xp ?? 0;
  const xpLevel = userProfile?.level ?? 1;
  const currentMin = userProfile?.currentLevelMinXp ?? 0;
  const nextMin = userProfile?.nextLevelMinXp ?? currentMin + 500;
  const xpInLevel = totalXP - currentMin;
  const xpToNext = Math.max(1, nextMin - currentMin);

  const studyHours = useMemo(() => {
    if (!userStats) return "0h";
    const hours = Math.floor(userStats.totalStudyMinutes / 60);
    return `${hours}h`;
  }, [userStats]);

  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Tiempo de Estudio",
        value: studyHours,
        icon: Clock,
        iconBg: `${theme.primary}18`,
        color: theme.primary,
      },
      {
        label: "Rutas activas",
        value: String(paths.length),
        icon: CheckCircle2,
        iconBg: `${theme.success}18`,
        color: theme.success,
      },
      {
        label: "Autonomía",
        value: `${avgProgress}%`,
        icon: TrendingUp,
        iconBg: `${theme.accent}18`,
        color: theme.accent,
      },
    ],
    [theme.primary, theme.success, theme.accent, paths.length, avgProgress, studyHours],
  );

  const iconCircle = (bgColor: string): ViewStyle => ({
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: bgColor,
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <AppContainer style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {trialExhausted && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => showPaywallModal('El acceso gratuito en este dispositivo')}
            style={[s.trialBanner, { backgroundColor: `${theme.accent}18`, borderColor: `${theme.accent}50` }]}
          >
            <AppText variant="verySmall" color={theme.accent} weight="700">
              Prueba gratuita agotada en este dispositivo
            </AppText>
            <AppText variant="verySmall" color={theme.accent}>
              Tocá para ver planes Prémium
            </AppText>
          </TouchableOpacity>
        )}

        {/* XP Level Bar */}
        <View style={[s.xpBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={s.xpBarLeft}>
            <View style={[s.levelBadge, { backgroundColor: theme.primary }]}>
              <AppText variant="verySmall" color="#FFFFFF" weight="bold">
                Nv.{xpLevel}
              </AppText>
            </View>
            <View style={s.xpInfo}>
              <AppText variant="verySmall" weight="700">
                {totalXP} XP acumulados
              </AppText>
              <AppText variant="verySmall" muted>
                {xpToNext - xpInLevel} XP para nivel {xpLevel + 1}
              </AppText>
            </View>
          </View>
          <View style={[s.xpMiniBar, { backgroundColor: theme.border }]}>
            <View style={[s.xpMiniBarFill, { backgroundColor: theme.primary, width: `${Math.min(100, (xpInLevel / xpToNext) * 100)}%` }]} />
          </View>
          <View style={s.xpBarRight}>
            {userBadge === 'free' && !isGuest && (
              <TouchableOpacity
                onPress={() => showPaywallModal()}
                style={[s.planChip, { backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}40` }]}
              >
                <Zap size={11} color={theme.primary} />
                <AppText variant="verySmall" color={theme.primary} weight="700">Ver planes</AppText>
              </TouchableOpacity>
            )}
            {userBadge !== 'free' && userBadge !== 'vip' && (
              <View style={[s.planChip, { backgroundColor: '#6366F115', borderColor: '#6366F140' }]}>
                <Gem size={11} color="#6366F1" />
                <AppText variant="verySmall" color="#6366F1" weight="700">{userProfile?.planLabel ?? userBadge}</AppText>
              </View>
            )}
            {userBadge === 'vip' && (
              <View style={[s.planChip, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B40' }]}>
                <Crown size={11} color="#F59E0B" />
                <AppText variant="verySmall" color="#F59E0B" weight="700">VIP</AppText>
              </View>
            )}
            <TouchableOpacity
              onPress={() => router.push("/(protected)/profile")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <UserCircle size={28} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <HomeQuotaStatus />

        {/* Guest banner */}
        {isGuest && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[s.guestBanner, { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}40` }]}
            onPress={() => router.push("/(protected)/profile")}
          >
            <View style={[s.guestBannerDot, { backgroundColor: theme.accent }]} />
            <View style={s.guestBannerText}>
              <AppText variant="verySmall" weight="700" color={theme.accent}>
                Estás usando una cuenta de invitado
              </AppText>
              <AppText variant="verySmall" muted>
                Vinculá tu cuenta para no perder tu progreso →
              </AppText>
            </View>
          </TouchableOpacity>
        )}

        {/* Welcome Card */}
        <View
          style={[
            s.welcomeCard,
            {
              backgroundColor: theme.primaryLight,
              borderColor: `${theme.primary}20`,
            },
          ]}
        >
          <View style={s.welcomeContent}>
            <View style={[s.greetingBadge, { backgroundColor: `${theme.primary}18` }]}>
              <AppText variant="verySmall" color={theme.primary} weight="700">
                {greeting} 👋
              </AppText>
            </View>
            <AppText variant="bigTitle" color={theme.textPrimary} style={s.mt8}>
              {userProfile?.name ?? "Estudiante"}
            </AppText>
            <AppText variant="paragraph" color={theme.textMuted} style={s.mt4}>
              ¿Qué vamos a aprender hoy?
            </AppText>
          </View>
          <View style={[s.welcomeDecoBig, { backgroundColor: theme.primary }]} />
          <View style={[s.welcomeDecoSmall, { backgroundColor: theme.accent }]} />
          <View style={s.welcomeDecoIcon}>
            <GraduationCap size={72} color={`${theme.primary}20`} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsRow}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <GlassCard
                key={stat.label}
                padding={14}
                style={{
                  ...s.statCard,
                  borderTopWidth: 3,
                  borderTopColor: stat.color,
                }}
              >
                <View style={[iconCircle(stat.iconBg)]}>
                  <Icon size={22} color={stat.color} />
                </View>
                <AppText variant="bigSubtitle" weight="bold" style={s.statValue}>
                  {stat.value}
                </AppText>
                <AppText variant="verySmall" muted>
                  {stat.label}
                </AppText>
              </GlassCard>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AppText variant="smallTitle">Acciones Rápidas</AppText>
          </View>
          <View style={s.quickActionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[s.quickAction, { backgroundColor: theme.success }]}
              onPress={() => router.push("/(protected)/(tabs)/learning-path")}
            >
              <View style={[s.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Plus size={22} color="#FFFFFF" />
              </View>
              <AppText variant="smallSubtitle" color="#FFFFFF" weight="bold" align="center" style={s.mt8}>
                Nueva Ruta
              </AppText>
              <AppText variant="verySmall" color="rgba(255,255,255,0.75)" align="center">
                Empieza a aprender
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[s.quickAction, { backgroundColor: theme.primary }]}
              onPress={() => router.navigate("/(protected)/(tabs)/tutor")}
            >
              <View style={[s.quickActionIcon, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <BookOpen size={22} color="#FFFFFF" />
              </View>
              <AppText variant="smallSubtitle" color="#FFFFFF" weight="bold" align="center" style={s.mt8}>
                Tutor AI
              </AppText>
              <AppText variant="verySmall" color="rgba(255,255,255,0.75)" align="center">
                Resuelve tus dudas
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ongoing Paths */}
        {paths.length > 0 ? (
          <>
            <View style={s.sectionHeader}>
              <AppText variant="smallTitle">Rutas en curso</AppText>
              {paths.length > 3 && (
                <TouchableOpacity onPress={() => router.push("/(protected)/all-paths")}>
                  <AppText variant="smallParagraph" color={theme.primary} weight="600">
                    Ver todas
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
            {paths.slice(0, 3).map((path) => {
              const progress = getPathProgressPercent(path);
              const remaining = (path.chapterCount ?? 0) - (path.completedChapterCount ?? 0);
              return (
                <TouchableOpacity
                  key={path.id}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/(protected)/path-detail",
                      params: { pathId: path.id },
                    })
                  }
                >
                  <GlassCard variant="accent" style={s.pathCard} padding={16}>
                    <View style={s.pathHeader}>
                      <View style={s.pathTitleRow}>
                        <View style={[s.pathIconBox, { backgroundColor: `${theme.primary}12` }]}>
                          <Target size={18} color={theme.primary} />
                        </View>
                        <View style={s.pathTitleCol}>
                          <AppText variant="smallSubtitle" weight="600" numberOfLines={1}>
                            {path.title}
                          </AppText>
                          <AppText variant="verySmall" muted>
                            {remaining} capítulos restantes
                          </AppText>
                        </View>
                      </View>
                      <View style={[s.progressBadge, { backgroundColor: theme.primaryLight }]}>
                        <AppText variant="verySmall" color={theme.primary} weight="bold">
                          {progress}%
                        </AppText>
                      </View>
                    </View>
                    <ProgressBar progress={progress} variant="primary" size="small" />
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <GlassCard padding={24} style={s.emptyCard}>
            <GraduationCap size={36} color={theme.textMuted} />
            <AppText variant="smallSubtitle" weight="600" style={s.mt8}>
              Sin rutas activas
            </AppText>
            <AppText variant="smallParagraph" muted align="center" style={s.mt4}>
              Creá tu primera ruta de aprendizaje y empezá hoy.
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[s.emptyAction, { backgroundColor: theme.primary }]}
              onPress={() => router.push("/(protected)/(tabs)/learning-path")}
            >
              <Plus size={16} color="#FFFFFF" />
              <AppText variant="smallParagraph" color="#FFFFFF" weight="600">
                Nueva ruta
              </AppText>
            </TouchableOpacity>
          </GlassCard>
        )}

        {/* Completed Paths */}
        {completedPaths.length > 0 && (
          <>
            <View style={[s.sectionHeader, { marginTop: 24 }]}>
              <AppText variant="smallTitle">Rutas completadas</AppText>
              {completedPaths.length > 3 && (
                <TouchableOpacity onPress={() => router.push("/(protected)/all-paths")}>
                  <AppText variant="smallParagraph" color={theme.primary} weight="600">
                    Ver todas
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
            {completedPaths.slice(0, 3).map((path) => (
              <TouchableOpacity
                key={path.id}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: "/(protected)/path-detail", params: { pathId: path.id } })}
              >
                <GlassCard style={s.pathCard} padding={16}>
                  <View style={s.pathHeader}>
                    <View style={s.pathTitleRow}>
                      <View style={[s.pathIconBox, { backgroundColor: `${theme.success}12` }]}>
                        <CheckCircle2 size={18} color={theme.success} />
                      </View>
                      <View style={s.pathTitleCol}>
                        <AppText variant="smallSubtitle" weight="600" numberOfLines={1}>
                          {path.title}
                        </AppText>
                        <AppText variant="verySmall" muted>
                          {path.earnedXp} XP · Completada
                        </AppText>
                      </View>
                    </View>
                    <View style={[s.progressBadge, { backgroundColor: `${theme.success}15` }]}>
                      <AppText variant="verySmall" color={theme.success} weight="bold">
                        100%
                      </AppText>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

    </AppContainer>
  );
};

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  welcomeCard: {
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
    minHeight: 130,
  },
  welcomeContent: {
    zIndex: 1,
  },
  greetingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 2,
  },
  welcomeDecoBig: {
    position: "absolute",
    top: -36,
    right: -36,
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.18,
  },
  welcomeDecoSmall: {
    position: "absolute",
    bottom: -16,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.12,
  },
  welcomeDecoIcon: {
    position: "absolute",
    right: 14,
    bottom: 10,
    opacity: 1,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  trialBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 2,
  },
  xpBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    gap: 12,
  },
  xpBarLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  xpInfo: { flex: 1 },
  xpMiniBar: { width: 60, height: 6, borderRadius: 3, overflow: "hidden" },
  xpMiniBarFill: { height: 6, borderRadius: 3 },
  xpBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  planChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    marginTop: 12,
    marginBottom: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pathCard: {
    marginBottom: 12,
  },
  pathHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pathTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  pathTitleCol: {
    flex: 1,
  },
  pathIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  emptyCard: {
    alignItems: "center",
    gap: 4,
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  guestBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  guestBannerText: { flex: 1, gap: 2 },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
});

export default React.memo(Home);
