import { View, StyleSheet } from "react-native";
import { Clock, RefreshCw } from "lucide-react-native";
import type { SubscriptionPlan } from "../../../../domain/entities/catalog.entity";
import {
  formatQuotaRenewalDate,
  formatQuotaRenewalPolicy,
} from "../../../utils/quota-renewal.utils";
import { useQuotaRenewalCountdown } from "../../../hooks/useQuotaRenewalCountdown";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AppText from "../typography/AppText";

interface QuotaRenewalChipProps {
  plan: SubscriptionPlan;
  /** Plan activo del usuario — muestra countdown en vivo */
  isActivePlan?: boolean;
  quotaRenewsAt?: string | null;
  compact?: boolean;
  /** Oculta el texto de política para planes no activos (útil en Home) */
  showPolicyHint?: boolean;
  /** Sin márgenes externos — dentro de otra tarjeta con padding propio */
  nested?: boolean;
}

export default function QuotaRenewalChip({
  plan,
  isActivePlan = false,
  quotaRenewsAt = null,
  compact = false,
  showPolicyHint = true,
  nested = false,
}: QuotaRenewalChipProps) {
  const theme = useThemeColors();
  const countdown = useQuotaRenewalCountdown(
    isActivePlan ? quotaRenewsAt : null,
  );
  const policy = formatQuotaRenewalPolicy(plan);
  const renewsAtLabel = formatQuotaRenewalDate(
    isActivePlan ? quotaRenewsAt : null,
  );

  if (plan.isUnlimited) return null;

  const showCountdown = isActivePlan && countdown != null;
  const primaryText = showCountdown ? countdown : policy;
  if (!primaryText) return null;

  const Icon = showCountdown ? Clock : RefreshCw;
  const accent = showCountdown ? theme.accent : theme.primary;

  return (
    <View
      style={[
        s.wrap,
        compact ? s.wrapCompact : null,
        nested ? s.wrapNested : null,
        {
          backgroundColor: `${accent}14`,
          borderColor: `${accent}35`,
        },
      ]}
    >
      <Icon size={compact ? 14 : 16} color={accent} />
      <View style={s.textWrap}>
        <AppText
          variant={compact ? "verySmall" : "smallParagraph"}
          color={accent}
          weight="700"
        >
          {primaryText}
        </AppText>
        {showCountdown && renewsAtLabel ? (
          <AppText variant="verySmall" muted>
            Próximo reinicio: {renewsAtLabel}
          </AppText>
        ) : !showCountdown && plan.quotaResetDays && showPolicyHint ? (
          <AppText variant="verySmall" muted>
            Al suscribirte, tus cupos siguen este ciclo
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  wrapCompact: {
    marginHorizontal: 0,
    marginBottom: 0,
    paddingVertical: 8,
  },
  wrapNested: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
