import type { SubscriptionPlan } from "../../domain/entities/catalog.entity";

export function buildPlanBenefits(plan: SubscriptionPlan | null): string[] {
  if (!plan) {
    return [
      "Rutas de aprendizaje ilimitadas",
      "Tutor con IA sin restricciones",
      "Resúmenes inteligentes de documentos",
      "Experiencia sin publicidad",
    ];
  }

  const benefits: string[] = [];

  if (plan.maxStandardPaths == null && plan.maxDeepPaths == null) {
    benefits.push("Rutas de aprendizaje ilimitadas");
  } else {
    if (plan.maxStandardPaths == null) {
      benefits.push("Rutas estándar ilimitadas");
    } else if (plan.maxStandardPaths > 0) {
      benefits.push(`Hasta ${plan.maxStandardPaths} rutas estándar`);
    }
    if (plan.maxDeepPaths == null) {
      benefits.push("Rutas profundas ilimitadas");
    } else if (plan.maxDeepPaths > 0) {
      benefits.push(`Hasta ${plan.maxDeepPaths} rutas profundas`);
    }
  }

  if (plan.maxChapters != null) {
    benefits.push(`Hasta ${plan.maxChapters} capítulos por ruta`);
  }

  if (plan.maxTutorRequests == null) {
    benefits.push("Tutor con IA sin restricciones");
  } else if (plan.maxTutorRequests > 0) {
    benefits.push(`Hasta ${plan.maxTutorRequests} mensajes de tutor con IA`);
  }

  if (plan.maxSummaryRequests == null) {
    benefits.push("Resúmenes inteligentes de documentos");
  } else if (plan.maxSummaryRequests > 0) {
    benefits.push(`Hasta ${plan.maxSummaryRequests} resúmenes inteligentes`);
  }

  if (!plan.adsEnabled) {
    benefits.push("Experiencia sin publicidad");
  }

  return benefits;
}

/** @deprecated Usar QuotaRenewalChip — evita duplicar en lista de beneficios */
export function buildQuotaRenewalLabel(plan: SubscriptionPlan): string | null {
  if (plan.quotaResetDays == null || plan.quotaResetDays <= 0) return null;
  const scope = plan.quotaScope === "user" ? "por cuenta" : "por dispositivo";
  return `Cupos se renuevan cada ${plan.quotaResetDays} días (${scope})`;
}

export function formatPlanPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return `$${Number(value).toFixed(0)}`;
}

export function annualDiscountLabel(
  monthly: number | null,
  annual: number | null,
): string | null {
  if (monthly == null || annual == null || monthly <= 0) return null;
  const fullYear = monthly * 12;
  const pct = Math.round((1 - annual / fullYear) * 100);
  return pct > 0 ? `${pct}%` : null;
}

export function monthlyEquivalentLabel(annual: number | null): string | null {
  if (annual == null || annual <= 0) return null;
  return `$${(annual / 12).toFixed(0)}/mes`;
}

export function planHighlightLabel(plan: SubscriptionPlan): string | null {
  if (plan.isUnlimited) return "Ilimitado";
  if (plan.sortOrder >= 2) return "Más popular";
  return null;
}

/** Planes del paywall por encima del plan activo (sin repetir el actual). */
export function filterUpgradePaywallPlans(
  paywallPlans: SubscriptionPlan[],
  allPlans: SubscriptionPlan[],
  activePlanCode: string | null | undefined,
  options?: { hasUnlimitedAccess?: boolean },
): SubscriptionPlan[] {
  if (options?.hasUnlimitedAccess) return [];

  const sorted = [...paywallPlans]
    .filter((p) => !p.isDefaultFree)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!activePlanCode) return sorted;

  const current =
    allPlans.find((p) => p.code === activePlanCode) ??
    allPlans.find((p) => p.isDefaultFree) ??
    null;

  if (current?.isUnlimited) return [];

  const currentSortOrder = current?.sortOrder ?? -1;

  return sorted.filter(
    (p) => p.code !== activePlanCode && p.sortOrder > currentSortOrder,
  );
}
