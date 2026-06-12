import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Gauge } from "lucide-react-native";
import { useMemo } from "react";
import { useAppSelector } from "../../../../application/store/hooks";
import { selectSubscriptionPlans } from "../../../../application/selectors/catalog.selectors";
import {
  selectHasUnlimitedAccess,
  selectQuotaRemainingSummary,
  selectQuotaRenewsAt,
  selectTrialExhausted,
  selectUserProfile,
} from "../../../../application/selectors/user.selectors";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { showPaywallModal } from "../../../../infrastructure/api/plan-error.utils";
import QuotaRenewalChip from "./QuotaRenewalChip";
import AppText from "../typography/AppText";

export default function HomeQuotaStatus() {
  const theme = useThemeColors();
  const profile = useAppSelector(selectUserProfile);
  const catalogPlans = useAppSelector(selectSubscriptionPlans);
  const quotaItems = useAppSelector(selectQuotaRemainingSummary);
  const quotaRenewsAt = useAppSelector(selectQuotaRenewsAt);
  const hasUnlimitedAccess = useAppSelector(selectHasUnlimitedAccess);
  const trialExhausted = useAppSelector(selectTrialExhausted);

  const currentPlan = useMemo(
    () => catalogPlans.find((p) => p.code === profile?.planCode) ?? null,
    [catalogPlans, profile?.planCode],
  );

  if (hasUnlimitedAccess) return null;
  if (trialExhausted && quotaItems.every((item) => item.remaining <= 0)) return null;
  if (quotaItems.length === 0 && !quotaRenewsAt) return null;

  const showRenewal =
    currentPlan != null && !currentPlan.isUnlimited && quotaRenewsAt != null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => showPaywallModal()}
      style={[s.wrap, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.iconWrap, { backgroundColor: `${theme.primary}15` }]}>
            <Gauge size={16} color={theme.primary} />
          </View>
          <View>
            <AppText variant="verySmall" weight="700">
              Cupos del plan
            </AppText>
            <AppText variant="verySmall" muted>
              {profile?.planLabel ?? "Tu plan actual"}
            </AppText>
          </View>
        </View>
        <AppText variant="verySmall" color={theme.primary} weight="700">
          Ver planes →
        </AppText>
      </View>

      {quotaItems.length > 0 ? (
        <View style={s.pills}>
          {quotaItems.map((item) => {
            const exhausted = item.remaining <= 0;
            const accent = exhausted ? theme.textMuted : theme.primary;
            return (
              <View
                key={item.key}
                style={[
                  s.pill,
                  {
                    backgroundColor: exhausted ? `${theme.textMuted}12` : `${theme.primary}12`,
                    borderColor: exhausted ? `${theme.textMuted}30` : `${theme.primary}30`,
                  },
                ]}
              >
                <AppText variant="verySmall" muted={exhausted}>
                  {item.label}
                </AppText>
                <AppText variant="verySmall" color={accent} weight="700">
                  {item.remaining}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : null}

      {showRenewal ? (
        <QuotaRenewalChip
          plan={currentPlan}
          isActivePlan
          quotaRenewsAt={quotaRenewsAt}
          compact
          nested
          showPolicyHint={false}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
});
