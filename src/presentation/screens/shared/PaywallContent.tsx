import { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Crown, Sparkles, Mail } from "lucide-react-native";
import { router } from "expo-router";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useAppDispatch, useAppSelector } from "../../../application/store/hooks";
import { selectPaywallPlans, selectSubscriptionPlans } from "../../../application/selectors/catalog.selectors";
import { fetchCatalog } from "../../../application/thunks/catalog.thunks";
import { fetchProfile } from "../../../application/thunks/user.thunks";
import {
  selectQuotaRenewsAt,
  selectHasUnlimitedAccess,
  selectIsVip,
  selectUserProfile,
} from "../../../application/selectors/user.selectors";
import type { SubscriptionPlan } from "../../../domain/entities/catalog.entity";
import {
  annualDiscountLabel,
  filterUpgradePaywallPlans,
  formatPlanPrice,
  monthlyEquivalentLabel,
} from "../../utils/subscription-plan.utils";
import AppText from "../../components/ui/typography/AppText";
import AppButton from "../../components/ui/buttons/AppButton";
import PlanCarousel from "../../components/ui/subscription/PlanCarousel";
import QuotaRenewalChip from "../../components/ui/subscription/QuotaRenewalChip";

export interface PaywallContentProps {
  onClose: () => void;
  featureBlocked?: string;
  showCloseButton?: boolean;
  showPlanLink?: boolean;
}

type BillingCycle = "monthly" | "annual";

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    code: "pro",
    label: "Pro",
    priceMonthly: 3,
    priceAnnual: 30,
    maxStandardPaths: 10,
    maxDeepPaths: 5,
    maxChapters: null,
    maxLessons: null,
    maxTutorRequests: 50,
    maxSummaryRequests: 20,
    adsEnabled: false,
    isDefaultFree: false,
    isUnlimited: false,
    showInPaywall: true,
    sortOrder: 1,
    quotaResetDays: 15,
    quotaScope: "user",
    enforceDeviceTrialSlot: false,
  },
  {
    code: "premium",
    label: "Premium",
    priceMonthly: 5,
    priceAnnual: 50,
    maxStandardPaths: null,
    maxDeepPaths: null,
    maxChapters: null,
    maxLessons: null,
    maxTutorRequests: null,
    maxSummaryRequests: null,
    adsEnabled: false,
    isDefaultFree: false,
    isUnlimited: true,
    showInPaywall: true,
    sortOrder: 2,
    quotaResetDays: null,
    quotaScope: "user",
    enforceDeviceTrialSlot: false,
  },
];

const PaywallContent = ({
  onClose,
  featureBlocked,
  showCloseButton = true,
  showPlanLink = false,
}: PaywallContentProps) => {
  const theme = useThemeColors();
  const dispatch = useAppDispatch();
  const paywallPlansFromStore = useAppSelector(selectPaywallPlans);
  const catalogPlans = useAppSelector(selectSubscriptionPlans);
  const profile = useAppSelector(selectUserProfile);
  const quotaRenewsAt = useAppSelector(selectQuotaRenewsAt);
  const hasUnlimitedAccess = useAppSelector(selectHasUnlimitedAccess);
  const isVip = useAppSelector(selectIsVip);
  const activePlanCode = profile?.planCode ?? null;
  const currentUserPlan = useMemo(
    () => catalogPlans.find((p) => p.code === activePlanCode) ?? null,
    [catalogPlans, activePlanCode],
  );

  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  useEffect(() => {
    let active = true;
    if (isVip) {
      dispatch(fetchProfile());
      return () => {
        active = false;
      };
    }
    setLoadingPlans(true);
    Promise.all([
      dispatch(fetchCatalog({ force: true })),
      dispatch(fetchProfile()),
    ]).finally(() => {
      if (active) setLoadingPlans(false);
    });
    return () => {
      active = false;
    };
  }, [dispatch, isVip]);

  const basePaywallPlans = paywallPlansFromStore.length > 0 ? paywallPlansFromStore : FALLBACK_PLANS;
  const upgradePlans = useMemo(() => {
    if (hasUnlimitedAccess) return [];
    return filterUpgradePaywallPlans(basePaywallPlans, catalogPlans, activePlanCode);
  }, [hasUnlimitedAccess, basePaywallPlans, catalogPlans, activePlanCode]);
  const hasPaidPlan =
    currentUserPlan != null &&
    !currentUserPlan.isDefaultFree &&
    !currentUserPlan.isUnlimited;
  const showCurrentPlanRenewal =
    currentUserPlan != null &&
    quotaRenewsAt != null &&
    !currentUserPlan.isUnlimited;
  const planNamesLabel = upgradePlans.map((p) => p.label).join(" y ");
  const heroTitle = isVip
    ? "Eres usuario VIP"
    : hasUnlimitedAccess
      ? "¡Ya tienes acceso completo!"
      : hasPaidPlan
        ? "Mejora tu plan"
        : "Elige tu plan";
  const heroSubtitle = isVip
    ? "Acceso ilimitado a rutas, tutor IA, resúmenes y más — sin restricciones."
    : hasUnlimitedAccess
      ? "Disfruta de todas las funciones sin límites en tu plan actual."
      : hasPaidPlan
        ? planNamesLabel
          ? `Pasa a ${planNamesLabel} y desbloquea más beneficios.`
          : "Explora las opciones para ampliar tu acceso."
        : planNamesLabel
          ? `Desliza para comparar ${planNamesLabel}. Rutas, tutor IA y resúmenes según el plan.`
          : "Rutas, tutor IA y resúmenes según el plan.";

  const selectedPlan = useMemo(() => {
    const code = selectedPlanCode ?? upgradePlans[0]?.code;
    return upgradePlans.find((p) => p.code === code) ?? upgradePlans[0] ?? null;
  }, [upgradePlans, selectedPlanCode]);

  useEffect(() => {
    if (upgradePlans.length === 0) {
      setSelectedPlanCode(null);
      return;
    }
    const isSelectedValid = selectedPlanCode != null &&
      upgradePlans.some((p) => p.code === selectedPlanCode);
    if (!isSelectedValid) {
      const defaultPlan = upgradePlans[0];
      if (defaultPlan) setSelectedPlanCode(defaultPlan.code);
    }
  }, [upgradePlans, selectedPlanCode]);

  const planLabel = selectedPlan?.label ?? "Prémium";
  const discountLabel = annualDiscountLabel(
    selectedPlan?.priceMonthly ?? null,
    selectedPlan?.priceAnnual ?? null,
  );
  const annualPerMonth = monthlyEquivalentLabel(selectedPlan?.priceAnnual ?? null);

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    const cycleLabel = billing === "annual" ? "anual" : "mensual";
    const subject = encodeURIComponent(`Suscripción I.C.O ${selectedPlan.label}`);
    const body = encodeURIComponent(
      `Hola, quiero suscribirme al plan ${selectedPlan.label} de I.C.O.\n\nPlan: ${selectedPlan.code} — ${cycleLabel}\nEmail de la cuenta: `,
    );
    Linking.openURL(`mailto:soporte@ico.app?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert(
        "Contacto",
        `Escríbenos a soporte@ico.app para activar tu suscripción ${selectedPlan.label}.`,
      );
    });
  };

  const showLoading = loadingPlans && paywallPlansFromStore.length === 0;

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={[theme.primary, `${theme.primary}DD`, theme.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          {showCloseButton ? (
            <TouchableOpacity
              style={s.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={s.closeBtnInner}>
                <X size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={s.heroBadge}>
            <Sparkles size={14} color="#FFFFFF" />
            <AppText variant="verySmall" color="#FFFFFF" weight="700">
              {isVip ? "ACCESO VIP" : "DESBLOQUEÁ TODO"}
            </AppText>
          </View>

          <View style={s.heroIcon}>
            <Crown size={40} color="#FFFFFF" fill="rgba(255,255,255,0.25)" />
          </View>

          <AppText variant="title" weight="700" align="center" color="#FFFFFF" style={s.heroTitle}>
            {heroTitle}
          </AppText>

          <AppText variant="smallParagraph" align="center" color="rgba(255,255,255,0.88)" style={s.heroSubtitle}>
            {heroSubtitle}
          </AppText>
        </LinearGradient>

        <View style={s.body}>
          {featureBlocked && !hasUnlimitedAccess ? (
            <View style={[s.blockedBanner, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
              <Sparkles size={16} color={theme.accent} />
              <View style={s.blockedTextWrap}>
                <AppText variant="smallParagraph" color={theme.accent} weight="700">
                  Función bloqueada
                </AppText>
                <AppText variant="verySmall" color={theme.textMuted}>
                  {featureBlocked} requiere un plan de pago.
                </AppText>
              </View>
            </View>
          ) : null}

          {isVip ? (
            <View style={[s.topPlanWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Crown size={32} color="#F59E0B" />
              <AppText variant="smallSubtitle" weight="700" align="center">
                Acceso VIP activo
              </AppText>
              <AppText variant="smallParagraph" muted align="center">
                No necesitas suscribirte a ningún plan. Todas las funciones están desbloqueadas para tu cuenta.
              </AppText>
            </View>
          ) : (
          <>
          <AppText variant="smallSubtitle" weight="700" style={s.sectionLabel}>
            {hasPaidPlan ? "Siguiente plan" : "Planes disponibles"}
          </AppText>

          {showLoading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={theme.primary} />
              <AppText variant="smallParagraph" muted align="center">
                Cargando planes…
              </AppText>
            </View>
          ) : upgradePlans.length === 0 ? (
            <View style={[s.topPlanWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Crown size={28} color={theme.primary} />
              <AppText variant="smallSubtitle" weight="700" align="center">
                {hasUnlimitedAccess
                  ? "Tienes el plan más completo"
                  : "No hay planes superiores disponibles"}
              </AppText>
              <AppText variant="smallParagraph" muted align="center">
                {currentUserPlan?.label
                  ? `Tu plan actual: ${currentUserPlan.label}`
                  : "Contáctanos si quieres cambiar tu suscripción."}
              </AppText>
              {showCurrentPlanRenewal && currentUserPlan ? (
                <QuotaRenewalChip
                  plan={currentUserPlan}
                  isActivePlan
                  quotaRenewsAt={quotaRenewsAt}
                  compact
                  showPolicyHint={false}
                />
              ) : null}
            </View>
          ) : (
            <>
              {showCurrentPlanRenewal && currentUserPlan ? (
                <View style={s.renewalChipWrap}>
                  <QuotaRenewalChip
                    plan={currentUserPlan}
                    isActivePlan
                    quotaRenewsAt={quotaRenewsAt}
                    compact
                    showPolicyHint={false}
                  />
                </View>
              ) : null}
              <PlanCarousel
                plans={upgradePlans}
                selectedPlanCode={selectedPlanCode}
                onSelectPlan={setSelectedPlanCode}
                billing={billing}
              />
            </>
          )}

          {upgradePlans.length > 0 ? (
          <>
          <AppText variant="smallSubtitle" weight="700" style={s.sectionLabel}>
            Facturación
          </AppText>

          <View style={s.plans}>
            <Pressable
              onPress={() => setBilling("monthly")}
              style={({ pressed }) => [
                s.planCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: billing === "monthly" ? theme.primary : theme.border,
                  borderWidth: billing === "monthly" ? 2 : StyleSheet.hairlineWidth,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <AppText variant="verySmall" muted weight="700" style={s.planLabel}>
                MENSUAL
              </AppText>
              <AppText variant="smallTitle" weight="700">
                {formatPlanPrice(selectedPlan?.priceMonthly)}
              </AppText>
              <AppText variant="verySmall" muted>
                por mes
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setBilling("annual")}
              style={({ pressed }) => [
                s.planCard,
                s.planCardAnnual,
                {
                  backgroundColor: billing === "annual" ? theme.primary : theme.surface,
                  borderColor: billing === "annual" ? theme.primary : theme.border,
                  borderWidth: billing === "annual" ? 2 : StyleSheet.hairlineWidth,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <View
                style={[
                  s.recommendedBadge,
                  billing === "annual"
                    ? [s.recommendedBadgeSelected, { backgroundColor: "#FFFFFF" }]
                    : { backgroundColor: theme.primary },
                ]}
              >
                <AppText
                  variant="verySmall"
                  weight="700"
                  color={billing === "annual" ? theme.primary : "#FFFFFF"}
                >
                  {discountLabel ? `Ahorra ${discountLabel}` : "Recomendado"}
                </AppText>
              </View>
              <AppText
                variant="verySmall"
                weight="700"
                color={billing === "annual" ? "rgba(255,255,255,0.9)" : theme.textMuted}
                style={s.planLabel}
              >
                ANUAL
              </AppText>
              <AppText variant="smallTitle" weight="700" color={billing === "annual" ? "#FFFFFF" : theme.textPrimary}>
                {formatPlanPrice(selectedPlan?.priceAnnual)}
              </AppText>
              <AppText variant="verySmall" color={billing === "annual" ? "rgba(255,255,255,0.82)" : theme.textMuted}>
                {annualPerMonth ? `${annualPerMonth} facturado al año` : "por año"}
              </AppText>
            </Pressable>
          </View>

          <View style={s.ctaWrap}>
            <AppButton variant="primary" widthFull style={s.ctaBtn} onPress={handleSubscribe}>
              <View style={s.ctaInner}>
                <Mail size={18} color="#FFFFFF" />
                <View style={s.ctaCopy}>
                  <AppText
                    variant="smallParagraph"
                    color="#FFFFFF"
                    weight="700"
                    align="center"
                    numberOfLines={2}
                  >
                    Suscribirme a {planLabel}
                  </AppText>
                  <AppText variant="verySmall" color="rgba(255,255,255,0.88)" align="center">
                    Plan {billing === "annual" ? "anual" : "mensual"}
                  </AppText>
                </View>
              </View>
            </AppButton>
          </View>

          <AppText variant="verySmall" muted align="center" style={s.trustLine}>
            Activación por email · Cancela cuando quieras
          </AppText>
          </>
          ) : null}
          </>
          )}

          {showPlanLink && !isVip ? (
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push("/(shared)/paywall");
              }}
              style={s.laterBtn}
            >
              <AppText variant="smallParagraph" color={theme.primary} weight="600">
                Ver detalle de planes
              </AppText>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={onClose} style={s.laterBtn}>
            <AppText variant="smallParagraph" muted>
              Quizás después
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  closeBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: { marginBottom: 8 },
  heroSubtitle: { maxWidth: 320, lineHeight: 20 },
  body: {
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  blockedTextWrap: { flex: 1, gap: 2 },
  sectionLabel: { marginBottom: -4, paddingHorizontal: 20 },
  renewalChipWrap: {
    paddingHorizontal: 20,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  topPlanWrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
  },
  plans: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
    paddingHorizontal: 20,
  },
  planCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    paddingTop: 20,
    alignItems: "center",
    gap: 4,
    minHeight: 128,
    justifyContent: "center",
  },
  planCardAnnual: {
    position: "relative",
    overflow: "visible",
  },
  recommendedBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 88,
    alignItems: "center",
  },
  recommendedBadgeSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  planLabel: {
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  ctaWrap: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  ctaBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  ctaCopy: {
    flex: 1,
    gap: 2,
    alignItems: "center",
  },
  trustLine: { marginTop: -6, paddingHorizontal: 20 },
  laterBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
});

export default PaywallContent;
