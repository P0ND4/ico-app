import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { ViewStyle } from "react-native";
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Plus,
  BookOpen,
  Target,
} from "lucide-react-native";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import GlassCard from "../../../components/ui/cards/GlassCard";
import ProgressBar from "../../../components/ui/feedback/ProgressBar";
import { useThemeColors } from "../../../hooks/useThemeColors";

interface StatItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconBg: string;
  color: string;
}

interface PathItem {
  id: string;
  title: string;
  progress: number;
  remaining: number;
}

const Home = () => {
  const theme = useThemeColors();

  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Tiempo de Estudio",
        value: "12h",
        icon: Clock,
        iconBg: `${theme.primary}18`,
        color: theme.primary,
      },
      {
        label: "Tareas",
        value: "18",
        icon: CheckCircle2,
        iconBg: `${theme.success}18`,
        color: theme.success,
      },
      {
        label: "Autonomía",
        value: "85%",
        icon: TrendingUp,
        iconBg: `${theme.accent}18`,
        color: theme.accent,
      },
    ],
    [theme.primary, theme.success, theme.accent],
  );

  const paths: PathItem[] = useMemo(
    () => [
      { id: "1", title: "Cálculo Multivariable", progress: 65, remaining: 4 },
      { id: "2", title: "Estructuras de Datos", progress: 30, remaining: 7 },
    ],
    [],
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Welcome Card */}
        <View style={[s.welcomeCard, { backgroundColor: theme.primaryLight, borderColor: `${theme.primary}18` }]}>
          <View style={s.welcomeContent}>
            <AppText variant="bigTitle" color={theme.textPrimary}>
              Hola, Estudiante
            </AppText>
            <AppText variant="paragraph" color={theme.textMuted} style={s.mt4}>
              ¿Qué vamos a aprender hoy?
            </AppText>
          </View>
          <View style={[s.welcomeDot, { backgroundColor: theme.primary }]} />
          <View style={[s.welcomeDot, s.welcomeDot2, { backgroundColor: theme.accent }]} />
        </View>

        {/* Stats Grid */}
        <View style={s.statsRow}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={stat.label} padding={14} style={s.statCard}>
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
              onPress={() => console.log("Nueva Ruta")}
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
              onPress={() => console.log("Tutor AI")}
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
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <AppText variant="smallTitle">Rutas en curso</AppText>
            <TouchableOpacity>
              <AppText variant="smallParagraph" color={theme.primary} weight="600">
                Ver todas
              </AppText>
            </TouchableOpacity>
          </View>
          {paths.map((path) => (
            <GlassCard
              key={path.id}
              variant="accent"
              style={s.pathCard}
              padding={16}
            >
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
                      {path.remaining} actividades restantes
                    </AppText>
                  </View>
                </View>
                <View style={[s.progressBadge, { backgroundColor: theme.primaryLight }]}>
                  <AppText variant="verySmall" color={theme.primary} weight="bold">
                    {path.progress}%
                  </AppText>
                </View>
              </View>
              <ProgressBar
                progress={path.progress}
                variant="primary"
                size="small"
              />
            </GlassCard>
          ))}
        </View>
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
  scrollContent: {
    paddingBottom: 32,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  welcomeContent: {
    zIndex: 1,
  },
  welcomeDot: {
    position: "absolute",
    top: -20,
    right: -10,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  welcomeDot2: {
    top: 40,
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.2,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
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
});

export default React.memo(Home);
