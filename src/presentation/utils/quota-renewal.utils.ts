import type { SubscriptionPlan } from "../../domain/entities/catalog.entity";

export function formatQuotaRenewalPolicy(plan: SubscriptionPlan): string | null {
  if (plan.isUnlimited) return null;
  if (plan.quotaResetDays == null || plan.quotaResetDays <= 0) {
    return "Cupos sin renovación automática";
  }
  const scope = plan.quotaScope === "user" ? "por cuenta" : "por dispositivo";
  return `Cupos se renuevan cada ${plan.quotaResetDays} días (${scope})`;
}

export function formatQuotaRenewalCountdown(
  renewsAt: string | Date | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!renewsAt) return null;
  const target = new Date(renewsAt);
  if (Number.isNaN(target.getTime())) return null;

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Renovando cupos…";

  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `Renueva en ${days} ${days === 1 ? "día" : "días"} ${hours}h`;
  }
  if (hours > 0) {
    return `Renueva en ${hours}h ${minutes}m`;
  }
  return `Renueva en ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

export function formatQuotaRenewalDate(
  renewsAt: string | Date | null | undefined,
): string | null {
  if (!renewsAt) return null;
  const target = new Date(renewsAt);
  if (Number.isNaN(target.getTime())) return null;
  return target.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
