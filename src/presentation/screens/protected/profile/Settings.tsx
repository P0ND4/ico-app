import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { ChevronLeft, Bell, Info, FileText, Shield, Mail, Sun, Moon, Monitor } from "lucide-react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import GlassCard from "../../../components/ui/cards/GlassCard";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { scheduleStudyReminder, cancelStudyReminder } from "../../../../infrastructure/notifications/study-reminder";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { setThemeMode, type ThemeMode } from "../../../../application/slices/user.slice";
import { selectThemeMode } from "../../../../application/selectors/user.selectors";
import { updateProfile } from "../../../../application/thunks/user.thunks";

const STUDY_REMINDER_KEY = "ico_study_reminder_enabled";

const THEME_OPTIONS: { key: ThemeMode; label: string; Icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { key: 'system', label: 'Sistema', Icon: Monitor },
  { key: 'light', label: 'Claro', Icon: Sun },
  { key: 'dark', label: 'Oscuro', Icon: Moon },
];

const Settings = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode) as ThemeMode;
  const [studyReminder, setStudyReminder] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STUDY_REMINDER_KEY).then((v) => {
      if (v === "true") setStudyReminder(true);
    });
  }, []);

  const toggleReminder = useCallback(async (value: boolean) => {
    if (value) {
      const granted = await scheduleStudyReminder();
      if (!granted) {
        Alert.alert(
          "Permisos necesarios",
          "Activá las notificaciones en Ajustes del dispositivo para recibir recordatorios.",
        );
        return;
      }
    } else {
      await cancelStudyReminder();
    }
    setStudyReminder(value);
    await AsyncStorage.setItem(STUDY_REMINDER_KEY, String(value));
  }, []);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "—";

  return (
    <AppContainer style={s.container}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title" style={s.headerTitle}>
          Configuración
        </AppText>
        <View style={s.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Notifications */}
        <GlassCard padding={20} style={s.section}>
          <View style={s.sectionHeader}>
            <Bell size={16} color={theme.primary} />
            <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
              Notificaciones
            </AppText>
          </View>
          <View style={[s.row, { borderTopColor: theme.border }]}>
            <View style={s.rowInfo}>
              <AppText variant="smallParagraph" weight="500">Recordatorio de estudio</AppText>
              <AppText variant="verySmall" muted>Recordatorio diario para mantener tu racha</AppText>
            </View>
            <Switch
              value={studyReminder}
              onValueChange={toggleReminder}
              trackColor={{ true: theme.primary, false: theme.border }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>

        {/* Appearance */}
        <GlassCard padding={20} style={s.section}>
          <View style={s.sectionHeader}>
            <Sun size={16} color={theme.primary} />
            <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
              Apariencia
            </AppText>
          </View>
          <View style={[s.themeRow, { borderTopColor: theme.border }]}>
            {THEME_OPTIONS.map(({ key, label, Icon }) => {
              const active = themeMode === key;
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => {
                    dispatch(setThemeMode(key));
                    dispatch(updateProfile({ themeMode: key }));
                  }}
                  style={[
                    s.themeChip,
                    {
                      backgroundColor: active ? theme.primary : theme.surface,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Icon size={14} color={active ? '#fff' : theme.textMuted} />
                  <AppText
                    variant="verySmall"
                    weight={active ? '700' : '500'}
                    color={active ? '#fff' : theme.textMuted}
                  >
                    {label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Support */}
        <GlassCard padding={20} style={s.section}>
          <View style={s.sectionHeader}>
            <Mail size={16} color={theme.primary} />
            <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
              Soporte
            </AppText>
          </View>
          <TouchableOpacity
            style={[s.row, { borderTopColor: theme.border }]}
            onPress={() => Linking.openURL('mailto:soporte@ico.app?subject=Soporte%20I.C.O')}
            activeOpacity={0.7}
          >
            <View style={s.rowWithIcon}>
              <Mail size={15} color={theme.textMuted} />
              <AppText variant="smallParagraph">Contactar soporte</AppText>
            </View>
            <ChevronLeft size={16} color={theme.textMuted} style={s.chevronRight} />
          </TouchableOpacity>
        </GlassCard>

        {/* About */}
        <GlassCard padding={20} style={s.section}>
          <View style={s.sectionHeader}>
            <Info size={16} color={theme.primary} />
            <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
              Sobre la app
            </AppText>
          </View>

          <View style={[s.row, { borderTopColor: theme.border }]}>
            <AppText variant="smallParagraph">Versión</AppText>
            <AppText variant="smallParagraph" muted>{appVersion}</AppText>
          </View>

          <TouchableOpacity
            style={[s.row, { borderTopColor: theme.border }]}
            onPress={() => Linking.openURL("https://ico.app/terms")}
            activeOpacity={0.7}
          >
            <View style={s.rowWithIcon}>
              <FileText size={15} color={theme.textMuted} />
              <AppText variant="smallParagraph">Términos y condiciones</AppText>
            </View>
            <ChevronLeft size={16} color={theme.textMuted} style={s.chevronRight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.row, { borderTopColor: theme.border }]}
            onPress={() => Linking.openURL("https://ico.app/privacy")}
            activeOpacity={0.7}
          >
            <View style={s.rowWithIcon}>
              <Shield size={15} color={theme.textMuted} />
              <AppText variant="smallParagraph">Política de privacidad</AppText>
            </View>
            <ChevronLeft size={16} color={theme.textMuted} style={s.chevronRight} />
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </AppContainer>
  );
};

const s = StyleSheet.create({
  container: { padding: 0, paddingTop: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: { flex: 1 },
  headerPlaceholder: { width: 26 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { flex: 1, gap: 2, marginRight: 12 },
  rowWithIcon: { flexDirection: "row", alignItems: "center", gap: 10 },
  chevronRight: { transform: [{ rotate: "180deg" }] },
  themeRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  themeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default React.memo(Settings);
