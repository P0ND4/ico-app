import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import {
  ChevronLeft,
  Settings,
  UserCircle,
  Star,
  Flame,
  CheckCircle2,
  Target,
  Timer,
  LogOut,
  Trash2,
  Link,
  Crown,
  Gem,
  Zap,
  Ticket,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import GlassCard from "../../../components/ui/cards/GlassCard";
import AppInput from "../../../components/ui/inputs/AppInput";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { selectUserProfile, selectUserStats, selectUserBadge } from "../../../../application/selectors/user.selectors";
import { selectIsGuest } from "../../../../application/selectors/auth.selectors";
import { updateProfile, deleteAccount } from "../../../../application/thunks/user.thunks";
import { logout, linkGoogle, linkApple } from "../../../../application/thunks/auth.thunks";
import { getDeleteAccountErrorMessage, getLinkAccountErrorMessage, isProviderAlreadyLinkedError } from "../../../../infrastructure/api/auth-error.utils";
import {
  configureGoogleSignIn,
  getGoogleDeveloperErrorMessage,
  isGoogleDeveloperError,
} from "../../../../infrastructure/auth/google-signin.utils";
import { RETRY_MESSAGE } from "../../../../shared/messages";

const Profile = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();

  const profile = useAppSelector(selectUserProfile);
  const stats = useAppSelector(selectUserStats);
  const isGuest = useAppSelector(selectIsGuest);
  const userBadge = useAppSelector(selectUserBadge);

  const [name, setName] = useState(profile?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [linkingApple, setLinkingApple] = useState(false);

  const initials = (profile?.name ?? "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    configureGoogleSignIn(GoogleSignin);
  }, []);

  const correctRate = stats
    ? stats.totalQuestionAnswers > 0
      ? Math.round((stats.correctAnswers / stats.totalQuestionAnswers) * 100)
      : 0
    : 0;

  const handleSaveProfile = useCallback(async () => {
    if (!name.trim()) return;
    setSavingProfile(true);
    try {
      await dispatch(updateProfile({ name: name.trim() })).unwrap();
    } catch {
      Alert.alert("Error", `No se pudo actualizar el perfil. ${RETRY_MESSAGE}`);
    } finally {
      setSavingProfile(false);
    }
  }, [dispatch, name]);

  const handleLogout = useCallback(() => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await dispatch(logout()).unwrap();
        },
      },
    ]);
  }, [dispatch]);

  const handleDeleteAccount = useCallback(() => {
    const title = isGuest ? "Eliminar datos de invitado" : "Eliminar cuenta";
    const message = isGuest
      ? "Se borrarán permanentemente tus datos de invitado en el servidor. Esta acción es irreversible. ¿Estás seguro?"
      : "Esta acción es permanente e irreversible. ¿Estás seguro?";

    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteAccount()).unwrap();
          } catch (err) {
            Alert.alert("Error", getDeleteAccountErrorMessage(err, isGuest));
          }
        },
      },
    ]);
  }, [dispatch, isGuest]);

  const handleLinkGoogle = useCallback(async () => {
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        "Configuración faltante",
        "Define EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en ico-app/.env y reinicia Metro.",
      );
      return;
    }
    if (!configureGoogleSignIn(GoogleSignin)) return;

    setLinkingGoogle(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      if (signInResult.type === "cancelled") return;
      const tokens = await GoogleSignin.getTokens();
      if (!tokens.idToken) {
        Alert.alert("Error", `Google no devolvió un token. ${RETRY_MESSAGE}`);
        return;
      }
      await dispatch(linkGoogle(tokens.idToken)).unwrap();
    } catch (err) {
      const message = isGoogleDeveloperError(err)
        ? getGoogleDeveloperErrorMessage()
        : getLinkAccountErrorMessage(err, "google");
      Alert.alert(
        isProviderAlreadyLinkedError(err) ? "Cuenta ya vinculada" : "Error",
        message,
      );
    } finally {
      setLinkingGoogle(false);
    }
  }, [dispatch]);

  const handleLinkApple = useCallback(async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("No disponible", "La vinculación con Apple solo está disponible en iOS.");
      return;
    }
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      Alert.alert("No disponible", "Apple Sign In no está disponible en este dispositivo.");
      return;
    }
    setLinkingApple(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const fullName =
        credential.fullName?.givenName && credential.fullName?.familyName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : (credential.fullName?.givenName ?? undefined);
      await dispatch(
        linkApple({
          identityToken: credential.identityToken ?? "",
          ...(fullName ? { fullName } : {}),
        }),
      ).unwrap();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "ERR_REQUEST_CANCELED") return;
      Alert.alert(
        isProviderAlreadyLinkedError(err) ? "Cuenta ya vinculada" : "Error",
        getLinkAccountErrorMessage(err, "apple"),
      );
    } finally {
      setLinkingApple(false);
    }
  }, [dispatch]);

  return (
    <AppContainer style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title" style={s.headerTitle}>
          Mi Perfil
        </AppText>
        <TouchableOpacity
          onPress={() => router.push("/(protected)/settings")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Settings size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {/* User card */}
        <GlassCard variant="accent" padding={20} style={s.userCard}>
          <View style={s.avatarRow}>
            <View style={[s.avatar, { backgroundColor: theme.primary }]}>
              {profile?.avatarUrl ? (
                <UserCircle size={48} color="#FFFFFF" />
              ) : (
                <AppText variant="bigSubtitle" color="#FFFFFF" weight="bold">
                  {initials}
                </AppText>
              )}
            </View>
            <View style={s.userInfo}>
              <AppText variant="smallTitle" weight="700" numberOfLines={1}>
                {profile?.name ?? "Invitado"}
              </AppText>
              <AppText variant="smallParagraph" muted numberOfLines={1}>
                {profile?.email ?? "Sin cuenta vinculada"}
              </AppText>
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: `${theme.primary}18` }]}>
                  <Star size={12} color={theme.primary} />
                  <AppText variant="verySmall" color={theme.primary} weight="700">
                    Nv.{profile?.level ?? 1}
                  </AppText>
                </View>
                <View style={[s.badge, { backgroundColor: `${theme.accent}18` }]}>
                  <Flame size={12} color={theme.accent} />
                  <AppText variant="verySmall" color={theme.accent} weight="700">
                    {profile?.streakDays ?? 0} días
                  </AppText>
                </View>
                {userBadge === "vip" && (
                  <View style={[s.badge, { backgroundColor: "#F59E0B18" }]}>
                    <Crown size={12} color="#F59E0B" />
                    <AppText variant="verySmall" color="#F59E0B" weight="700">VIP</AppText>
                  </View>
                )}
                {userBadge !== "free" && userBadge !== "vip" && (
                  <View style={[s.badge, { backgroundColor: "#6366F118" }]}>
                    <Gem size={12} color="#6366F1" />
                    <AppText variant="verySmall" color="#6366F1" weight="700">
                      {profile?.planLabel ?? userBadge}
                    </AppText>
                  </View>
                )}
                {userBadge === "free" && !isGuest && (
                  <View style={[s.badge, { backgroundColor: `${theme.primary}18` }]}>
                    <Zap size={12} color={theme.primary} />
                    <AppText variant="verySmall" color={theme.primary} weight="700">Gratuito</AppText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Stats row */}
        <View style={s.statsRow}>
          <GlassCard padding={14} style={{ ...s.statCard, borderTopWidth: 3, borderTopColor: theme.success }}>
            <View style={[s.statIcon, { backgroundColor: `${theme.success}18` }]}>
              <CheckCircle2 size={20} color={theme.success} />
            </View>
            <AppText variant="bigSubtitle" weight="bold" style={s.statValue}>
              {stats?.pathsCompleted ?? 0}
            </AppText>
            <AppText variant="verySmall" muted align="center">
              Rutas{"\n"}completadas
            </AppText>
          </GlassCard>

          <GlassCard padding={14} style={{ ...s.statCard, borderTopWidth: 3, borderTopColor: theme.primary }}>
            <View style={[s.statIcon, { backgroundColor: `${theme.primary}18` }]}>
              <Target size={20} color={theme.primary} />
            </View>
            <AppText variant="bigSubtitle" weight="bold" style={s.statValue}>
              {correctRate}%
            </AppText>
            <AppText variant="verySmall" muted align="center">
              Respuestas{"\n"}correctas
            </AppText>
          </GlassCard>

          <GlassCard padding={14} style={{ ...s.statCard, borderTopWidth: 3, borderTopColor: theme.accent }}>
            <View style={[s.statIcon, { backgroundColor: `${theme.accent}18` }]}>
              <Timer size={20} color={theme.accent} />
            </View>
            <AppText variant="bigSubtitle" weight="bold" style={s.statValue}>
              {stats?.pomodoroSessionsDone ?? 0}
            </AppText>
            <AppText variant="verySmall" muted align="center">
              Sesiones{"\n"}Pomodoro
            </AppText>
          </GlassCard>
        </View>

        {/* Coupons */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(protected)/coupons")}
        >
          <GlassCard padding={16} style={s.section}>
            <View style={s.couponRow}>
              <View style={[s.couponIcon, { backgroundColor: `${theme.primary}18` }]}>
                <Ticket size={20} color={theme.primary} />
              </View>
              <View style={s.couponInfo}>
                <AppText variant="smallParagraph" weight="600">
                  Cupones
                </AppText>
                <AppText variant="verySmall" muted>
                  Canjea un código y suma cupos o beneficios
                </AppText>
              </View>
              <ChevronRight size={18} color={theme.textMuted} />
            </View>
          </GlassCard>
        </TouchableOpacity>

        {/* Edit profile */}
        <GlassCard padding={20} style={s.section}>
          <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
            Editar perfil
          </AppText>
          <AppInput value={name} onChangeText={setName} placeholder="Tu nombre" stylesContainer={s.input} />
          <AppButton variant="primary" widthFull loading={savingProfile} onPress={handleSaveProfile} style={s.saveBtn}>
            <AppText color="#FFFFFF" weight="600">
              Guardar cambios
            </AppText>
          </AppButton>
        </GlassCard>

        {/* Account section */}
        <GlassCard padding={20} style={s.section}>
          <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
            Cuenta
          </AppText>

          {isGuest && (
            <View style={s.linkSection}>
              <AppText variant="smallParagraph" muted style={s.linkHint}>
                Vincula tu cuenta para guardar tu progreso
              </AppText>
              <AppButton
                variant="secondary"
                widthFull
                loading={linkingGoogle}
                onPress={handleLinkGoogle}
                style={s.linkBtn}
              >
                <Link size={16} color={theme.textPrimary} />
                <AppText weight="600" style={s.linkBtnText}>
                  Vincular con Google
                </AppText>
              </AppButton>
              {Platform.OS === "ios" && (
                <AppButton
                  variant="secondary"
                  widthFull
                  loading={linkingApple}
                  onPress={handleLinkApple}
                  style={s.linkBtn}
                >
                  <Link size={16} color={theme.textPrimary} />
                  <AppText weight="600" style={s.linkBtnText}>
                    Vincular con Apple
                  </AppText>
                </AppButton>
              )}
              <View style={[s.divider, { backgroundColor: theme.border }]} />
            </View>
          )}

          <AppButton variant="danger" widthFull onPress={handleLogout} style={s.logoutBtn}>
            <LogOut size={16} color="#FFFFFF" />
            <AppText color="#FFFFFF" weight="600" style={s.actionBtnText}>
              Cerrar sesión
            </AppText>
          </AppButton>

          <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.7} style={s.deleteLink}>
            <Trash2 size={14} color={theme.danger} />
            <AppText variant="smallParagraph" color={theme.danger} style={s.deleteLinkText}>
              {isGuest ? "Eliminar datos de invitado" : "Eliminar cuenta"}
            </AppText>
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  userCard: { marginBottom: 16 },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { marginTop: 10, marginBottom: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { marginBottom: 14 },
  couponRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  couponInfo: { flex: 1, gap: 2 },
  input: { marginBottom: 12 },
  saveBtn: { borderRadius: 14 },
  linkSection: { marginBottom: 4 },
  linkHint: { marginBottom: 12 },
  linkBtn: { marginBottom: 10, gap: 8 },
  linkBtnText: { marginLeft: 4 },
  divider: { height: 1, marginVertical: 14 },
  logoutBtn: { marginBottom: 12, gap: 8 },
  actionBtnText: { marginLeft: 4 },
  deleteLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  deleteLinkText: { marginLeft: 2 },
});

export default React.memo(Profile);
