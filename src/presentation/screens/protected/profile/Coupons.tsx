import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  ChevronLeft,
  Ticket,
  Sparkles,
  Crown,
  Gift,
  Link,
  CheckCircle2,
  AlertCircle,
  History,
} from "lucide-react-native";
import { router } from "expo-router";
import AppContainer from "../../../components/ui/layout/AppContainer";
import AppText from "../../../components/ui/typography/AppText";
import AppButton from "../../../components/ui/buttons/AppButton";
import AppInput from "../../../components/ui/inputs/AppInput";
import GlassCard from "../../../components/ui/cards/GlassCard";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useAppDispatch, useAppSelector } from "../../../../application/store/hooks";
import { selectIsGuest } from "../../../../application/selectors/auth.selectors";
import {
  selectHasUnlimitedAccess,
  selectIsVip,
  selectPlanLabel,
  selectQuotaRemainingSummary,
} from "../../../../application/selectors/user.selectors";
import {
  selectCouponError,
  selectHasQuotaBonus,
  selectIsRedeemingCoupon,
  selectLastCouponRedeemed,
  selectSortedCouponRedemptions,
  selectVipExpiresAt,
} from "../../../../application/selectors/coupons.selectors";
import { clearCouponFeedback } from "../../../../application/slices/coupons.slice";
import { fetchCouponHistory, redeemCoupon } from "../../../../application/thunks/coupons.thunks";
import {
  isRedemptionActive,
  normalizeCouponCode,
  type CouponRedemption,
} from "../../../../domain/entities/coupon.entity";

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function grantTypeLabel(grantType: CouponRedemption["grantType"]): string {
  switch (grantType) {
    case "quota_bonus":
      return "Cupos extra";
    case "vip_access":
      return "Acceso VIP";
    case "plan_upgrade":
      return "Mejora de plan";
    default:
      return "Beneficio";
  }
}

const Coupons = () => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();

  const isGuest = useAppSelector(selectIsGuest);
  const isVip = useAppSelector(selectIsVip);
  const hasUnlimitedAccess = useAppSelector(selectHasUnlimitedAccess);
  const planLabel = useAppSelector(selectPlanLabel);
  const quotas = useAppSelector(selectQuotaRemainingSummary);
  const vipExpiresAt = useAppSelector(selectVipExpiresAt);
  const hasQuotaBonus = useAppSelector(selectHasQuotaBonus);
  const redemptions = useAppSelector(selectSortedCouponRedemptions);
  const redeeming = useAppSelector(selectIsRedeemingCoupon);
  const error = useAppSelector(selectCouponError);
  const lastRedeemed = useAppSelector(selectLastCouponRedeemed);

  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isGuest) {
      dispatch(fetchCouponHistory());
    }
    return () => {
      dispatch(clearCouponFeedback());
    };
  }, [dispatch, isGuest]);

  const handleChangeCode = useCallback(
    (value: string) => {
      setCode(value.toUpperCase());
      if (error || lastRedeemed) dispatch(clearCouponFeedback());
    },
    [dispatch, error, lastRedeemed],
  );

  const handleRedeem = useCallback(async () => {
    const normalized = normalizeCouponCode(code);
    if (!normalized || redeeming) return;
    const result = await dispatch(redeemCoupon(normalized));
    if (redeemCoupon.fulfilled.match(result)) {
      setCode("");
    }
  }, [code, dispatch, redeeming]);

  const goToProfile = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push("/(protected)/profile");
  }, []);

  const vipUntil = formatDate(vipExpiresAt);
  const canSubmit = normalizeCouponCode(code).length > 0;

  return (
    <AppContainer style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={26} color={theme.textPrimary} />
        </TouchableOpacity>
        <AppText variant="title" style={s.headerTitle}>
          Cupones
        </AppText>
        <View style={s.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Redeem / guest CTA */}
          {isGuest ? (
            <GlassCard variant="accent" padding={20} style={s.section}>
              <View style={s.sectionHeader}>
                <Link size={16} color={theme.primary} />
                <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
                  Vincula tu cuenta
                </AppText>
              </View>
              <AppText variant="smallParagraph" muted style={s.guestText}>
                Los cupones se canjean con una cuenta vinculada. Conecta tu cuenta de
                Google o Apple desde tu perfil y vuelve aquí para canjear tu código.
              </AppText>
              <AppButton variant="primary" widthFull onPress={goToProfile} style={s.primaryBtn}>
                <Link size={16} color="#FFFFFF" />
                <AppText color="#FFFFFF" weight="600" style={s.btnText}>
                  Ir a vincular mi cuenta
                </AppText>
              </AppButton>
            </GlassCard>
          ) : (
            <GlassCard variant="accent" padding={20} style={s.section}>
              <View style={s.sectionHeader}>
                <Ticket size={16} color={theme.primary} />
                <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
                  Canjear un cupón
                </AppText>
              </View>
              <AppText variant="smallParagraph" muted style={s.hint}>
                Ingresa tu código para sumar cupos, acceso VIP o una mejora de plan.
              </AppText>

              <AppInput
                value={code}
                onChangeText={handleChangeCode}
                placeholder="TUCODIGO"
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                maxLength={40}
                returnKeyType="send"
                editable={!redeeming}
                onSubmitEditing={handleRedeem}
                stylesContainer={s.input}
                style={s.inputText}
              />

              <AppButton
                variant="primary"
                widthFull
                loading={redeeming}
                disabled={!canSubmit || redeeming}
                onPress={handleRedeem}
                style={s.primaryBtn}
              >
                <AppText color="#FFFFFF" weight="600">
                  Canjear cupón
                </AppText>
              </AppButton>

              {lastRedeemed && (
                <View style={[s.banner, { backgroundColor: `${theme.success}18` }]}>
                  <CheckCircle2 size={16} color={theme.success} />
                  <View style={s.bannerText}>
                    <AppText variant="smallParagraph" weight="600" color={theme.success}>
                      ¡Cupón canjeado!
                    </AppText>
                    <AppText variant="verySmall" muted>
                      {lastRedeemed.redemption?.effectSummary ??
                        lastRedeemed.redemption?.label ??
                        "Tu beneficio ya está activo."}
                    </AppText>
                  </View>
                </View>
              )}

              {error && (
                <View style={[s.banner, { backgroundColor: `${theme.danger}18` }]}>
                  <AlertCircle size={16} color={theme.danger} />
                  <View style={s.bannerText}>
                    <AppText variant="smallParagraph" color={theme.danger}>
                      {error}
                    </AppText>
                  </View>
                </View>
              )}
            </GlassCard>
          )}

          {/* Active benefits */}
          <GlassCard padding={20} style={s.section}>
            <View style={s.sectionHeader}>
              <Sparkles size={16} color={theme.primary} />
              <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
                Tus beneficios
              </AppText>
              {hasQuotaBonus && (
                <View style={[s.chip, { backgroundColor: `${theme.primary}18` }]}>
                  <Gift size={12} color={theme.primary} />
                  <AppText variant="verySmall" color={theme.primary} weight="700">
                    Bono activo
                  </AppText>
                </View>
              )}
            </View>

            <View style={[s.row, { borderTopColor: theme.border }]}>
              <AppText variant="smallParagraph">Plan actual</AppText>
              <AppText variant="smallParagraph" muted>
                {planLabel}
              </AppText>
            </View>

            {isVip && (
              <View style={[s.row, { borderTopColor: theme.border }]}>
                <View style={s.rowWithIcon}>
                  <Crown size={15} color="#F59E0B" />
                  <AppText variant="smallParagraph">Acceso VIP</AppText>
                </View>
                <AppText variant="smallParagraph" muted>
                  {vipUntil ? `Hasta el ${vipUntil}` : "Permanente"}
                </AppText>
              </View>
            )}

            {hasUnlimitedAccess ? (
              <View style={[s.row, { borderTopColor: theme.border }]}>
                <AppText variant="smallParagraph" muted>
                  Tienes acceso ilimitado: no consumes cupos.
                </AppText>
              </View>
            ) : quotas.length > 0 ? (
              quotas.map((quota) => (
                <View key={quota.key} style={[s.row, { borderTopColor: theme.border }]}>
                  <AppText variant="smallParagraph">{quota.label}</AppText>
                  <AppText variant="smallParagraph" weight="600" muted>
                    {quota.remaining} restantes
                  </AppText>
                </View>
              ))
            ) : (
              <View style={[s.row, { borderTopColor: theme.border }]}>
                <AppText variant="smallParagraph" muted>
                  Todavía no tenemos tus cupos. Vuelve a entrar en un momento.
                </AppText>
              </View>
            )}
          </GlassCard>

          {/* History */}
          <GlassCard padding={20} style={s.section}>
            <View style={s.sectionHeader}>
              <History size={16} color={theme.primary} />
              <AppText variant="smallSubtitle" weight="600" style={s.sectionTitle}>
                Cupones canjeados
              </AppText>
            </View>

            {redemptions.length === 0 ? (
              <View style={[s.row, { borderTopColor: theme.border }]}>
                <AppText variant="smallParagraph" muted>
                  {isGuest
                    ? "Vincula tu cuenta para empezar a canjear cupones."
                    : "Todavía no canjeaste ningún cupón."}
                </AppText>
              </View>
            ) : (
              redemptions.map((redemption) => {
                const active = isRedemptionActive(redemption);
                const until = formatDate(redemption.grantedUntil);
                const redeemedOn = formatDate(redemption.redeemedAt);
                return (
                  <View
                    key={redemption.id}
                    style={[s.historyRow, { borderTopColor: theme.border }]}
                  >
                    <View style={s.rowInfo}>
                      <AppText variant="smallParagraph" weight="600" numberOfLines={1}>
                        {redemption.label ?? redemption.code}
                      </AppText>
                      <AppText variant="verySmall" muted>
                        {redemption.effectSummary ?? grantTypeLabel(redemption.grantType)}
                      </AppText>
                      <AppText variant="verySmall" muted>
                        {redeemedOn ? `Canjeado el ${redeemedOn}` : redemption.code}
                        {until ? ` · Hasta el ${until}` : ""}
                      </AppText>
                    </View>
                    <View
                      style={[
                        s.chip,
                        {
                          backgroundColor: active
                            ? `${theme.success}18`
                            : `${theme.textMuted}18`,
                        },
                      ]}
                    >
                      <AppText
                        variant="verySmall"
                        weight="700"
                        color={active ? theme.success : theme.textMuted}
                      >
                        {active ? "Activo" : "Vencido"}
                      </AppText>
                    </View>
                  </View>
                );
              })
            )}
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppContainer>
  );
};

const s = StyleSheet.create({
  container: { padding: 0, paddingTop: 0 },
  flex: { flex: 1 },
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
  hint: { marginBottom: 12 },
  guestText: { marginBottom: 16 },
  input: { marginBottom: 12, borderRadius: 14 },
  inputText: { letterSpacing: 1.5, fontWeight: "600" },
  primaryBtn: { borderRadius: 14, gap: 8 },
  btnText: { marginLeft: 4 },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  bannerText: { flex: 1, gap: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowWithIcon: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowInfo: { flex: 1, gap: 2 },
});

export default React.memo(Coupons);
