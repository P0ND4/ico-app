import type { SubscriptionPlan } from '../../../domain/entities/catalog.entity';

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Normaliza respuesta API (camelCase o snake_case legacy). */
export function normalizeSubscriptionPlan(raw: Record<string, unknown>): SubscriptionPlan {
  return {
    code: String(raw.code ?? ''),
    label: String(raw.label ?? raw.code ?? 'Plan'),
    priceMonthly: toNullableNumber(raw.priceMonthly ?? raw.price_monthly),
    priceAnnual: toNullableNumber(raw.priceAnnual ?? raw.price_annual),
    maxStandardPaths: toNullableNumber(raw.maxStandardPaths ?? raw.max_standard_paths),
    maxDeepPaths: toNullableNumber(raw.maxDeepPaths ?? raw.max_deep_paths),
    maxChapters: toNullableNumber(raw.maxChapters ?? raw.max_chapters),
    maxLessons: toNullableNumber(raw.maxLessons ?? raw.max_lessons),
    maxTutorRequests: toNullableNumber(raw.maxTutorRequests ?? raw.max_tutor_requests),
    maxSummaryRequests: toNullableNumber(raw.maxSummaryRequests ?? raw.max_summary_requests),
    adsEnabled: Boolean(raw.adsEnabled ?? raw.ads_enabled ?? true),
    isDefaultFree: Boolean(raw.isDefaultFree ?? raw.is_default_free ?? false),
    isUnlimited: Boolean(raw.isUnlimited ?? raw.is_unlimited ?? false),
    showInPaywall: Boolean(raw.showInPaywall ?? raw.show_in_paywall ?? false),
    sortOrder: Number(raw.sortOrder ?? raw.sort_order ?? 0),
    quotaResetDays: toNullableNumber(raw.quotaResetDays ?? raw.quota_reset_days),
    quotaScope: (raw.quotaScope ?? raw.quota_scope ?? 'device') === 'user' ? 'user' : 'device',
    enforceDeviceTrialSlot: Boolean(
      raw.enforceDeviceTrialSlot ?? raw.enforce_device_trial_slot ?? false,
    ),
  };
}
