import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store/index';

export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserStats = (state: RootState) => state.user.stats;
export const selectUserStatus = (state: RootState) => state.user.status;

export const selectPlanLabel = (state: RootState) =>
  state.user.profile?.planLabel ?? state.user.profile?.planCode ?? 'Gratuito';

export const selectIsDefaultFreePlan = (state: RootState) => {
  const profile = state.user.profile;
  if (profile?.isDefaultFreePlan != null) return profile.isDefaultFreePlan;
  return (profile?.planCode ?? 'free') === 'free';
};

export const selectIsUnlimitedPlan = (state: RootState) => {
  const profile = state.user.profile;
  if (profile?.isUnlimitedPlan != null) return profile.isUnlimitedPlan;
  return profile?.isVip === true || profile?.planCode === 'premium';
};

export const selectIsVip = (state: RootState) => state.user.profile?.isVip === true;

export const selectHasUnlimitedAccess = createSelector(
  [selectIsUnlimitedPlan, selectIsVip],
  (isUnlimitedPlan, isVip) => isUnlimitedPlan || isVip,
);

/** @deprecated Use selectIsUnlimitedPlan */
export const selectIsPremium = selectIsUnlimitedPlan;

/** @deprecated Use selectHasUnlimitedAccess */
export const selectHasPremiumAccess = selectHasUnlimitedAccess;

export const selectShowAds = (state: RootState) => {
  const profile = state.user.profile;
  if (profile?.adsEnabled != null) return profile.adsEnabled;
  return profile?.planCode !== 'premium' && profile?.isVip !== true;
};

export const selectFreeTrialUsed = (state: RootState) =>
  state.user.profile?.freeTrialUsed === true;

export const selectTrialTutorRemaining = (state: RootState): number | null =>
  state.user.profile?.trialTutorRemaining ?? null;

export const selectTrialSummaryRemaining = (state: RootState): number | null =>
  state.user.profile?.trialSummaryRemaining ?? null;

export const selectTutorRequestLimit = (state: RootState): number | null =>
  state.user.profile?.tutorRequestLimit ?? null;

export const selectSummaryRequestLimit = (state: RootState): number | null =>
  state.user.profile?.summaryRequestLimit ?? null;

export const selectTrialStandardPathRemaining = (state: RootState): number | null =>
  state.user.profile?.trialStandardPathRemaining ?? null;

export const selectTrialDeepPathRemaining = (state: RootState): number | null =>
  state.user.profile?.trialDeepPathRemaining ?? null;

export const selectStandardPathLimit = (state: RootState): number | null =>
  state.user.profile?.standardPathLimit ?? null;

export const selectDeepPathLimit = (state: RootState): number | null =>
  state.user.profile?.deepPathLimit ?? null;

export const selectQuotaRenewsAt = (state: RootState): string | null =>
  state.user.profile?.quotaRenewsAt ?? null;

/** Trial/cupos agotados — preferir valor del backend. */
export const selectTrialExhausted = createSelector(
  [selectUserProfile, selectIsDefaultFreePlan, selectHasUnlimitedAccess, selectFreeTrialUsed],
  (profile, isDefaultFreePlan, hasUnlimitedAccess, freeTrialUsed) => {
    if (profile?.trialExhausted != null) return profile.trialExhausted;
    return isDefaultFreePlan && !hasUnlimitedAccess && freeTrialUsed;
  },
);

export const selectCanUseTutor = createSelector(
  [selectHasUnlimitedAccess, selectTrialExhausted, selectTrialTutorRemaining],
  (hasUnlimitedAccess, trialExhausted, tutorRemaining) => {
    if (hasUnlimitedAccess) return true;
    if (trialExhausted) return false;
    if (tutorRemaining != null) return tutorRemaining > 0;
    return false;
  },
);

export const selectCanUseSummary = createSelector(
  [selectHasUnlimitedAccess, selectTrialExhausted, selectTrialSummaryRemaining],
  (hasUnlimitedAccess, trialExhausted, summaryRemaining) => {
    if (hasUnlimitedAccess) return true;
    if (trialExhausted) return false;
    if (summaryRemaining != null) return summaryRemaining > 0;
    return false;
  },
);

export const selectCanGenerateStandardPath = createSelector(
  [selectHasUnlimitedAccess, selectTrialExhausted, selectTrialStandardPathRemaining],
  (hasUnlimitedAccess, trialExhausted, standardRemaining) => {
    if (hasUnlimitedAccess) return true;
    if (trialExhausted) return false;
    if (standardRemaining != null) return standardRemaining > 0;
    return false;
  },
);

export const selectCanGenerateDeepPath = createSelector(
  [selectHasUnlimitedAccess, selectTrialExhausted, selectTrialDeepPathRemaining],
  (hasUnlimitedAccess, trialExhausted, deepRemaining) => {
    if (hasUnlimitedAccess) return true;
    if (trialExhausted) return false;
    if (deepRemaining != null) return deepRemaining > 0;
    return false;
  },
);

/** @deprecated Usar selectCanUseTutor o selectCanUseSummary según la función. */
export const selectCanUsePremiumFeatures = selectCanUseTutor;

export const selectIsOnActiveTrial = createSelector(
  [selectHasUnlimitedAccess, selectTrialExhausted, selectIsDefaultFreePlan],
  (hasUnlimitedAccess, trialExhausted, isDefaultFreePlan) =>
    isDefaultFreePlan && !hasUnlimitedAccess && !trialExhausted,
);

export const selectTrialTutorLabel = createSelector(
  [selectHasUnlimitedAccess, selectTrialTutorRemaining],
  (hasUnlimitedAccess, remaining) => {
    if (hasUnlimitedAccess || remaining == null) return null;
    return remaining === 1
      ? '1 mensaje restante'
      : `${remaining} mensajes restantes`;
  },
);

export const selectTrialSummaryLabel = createSelector(
  [selectHasUnlimitedAccess, selectTrialSummaryRemaining],
  (hasUnlimitedAccess, remaining) => {
    if (hasUnlimitedAccess || remaining == null) return null;
    return remaining === 1
      ? '1 resumen restante'
      : `${remaining} resúmenes restantes`;
  },
);

export const selectTrialStandardPathLabel = createSelector(
  [selectHasUnlimitedAccess, selectTrialStandardPathRemaining],
  (hasUnlimitedAccess, remaining) => {
    if (hasUnlimitedAccess || remaining == null) return null;
    return remaining === 1
      ? '1 ruta estándar restante'
      : `${remaining} rutas estándar restantes`;
  },
);

export const selectTrialDeepPathLabel = createSelector(
  [selectHasUnlimitedAccess, selectTrialDeepPathRemaining],
  (hasUnlimitedAccess, remaining) => {
    if (hasUnlimitedAccess || remaining == null) return null;
    return remaining === 1
      ? '1 ruta profunda restante'
      : `${remaining} rutas profundas restantes`;
  },
);

export interface QuotaRemainingItem {
  key: 'tutor' | 'summary' | 'standardPath' | 'deepPath';
  label: string;
  remaining: number;
}

/** Resumen corto de cupos restantes para banners compactos (Home, etc.). */
export const selectQuotaRemainingSummary = createSelector(
  [
    selectHasUnlimitedAccess,
    selectTrialTutorRemaining,
    selectTrialSummaryRemaining,
    selectTrialStandardPathRemaining,
    selectTrialDeepPathRemaining,
  ],
  (
    hasUnlimitedAccess,
    tutorRemaining,
    summaryRemaining,
    standardRemaining,
    deepRemaining,
  ): QuotaRemainingItem[] => {
    if (hasUnlimitedAccess) return [];

    const items: QuotaRemainingItem[] = [];
    if (tutorRemaining != null) {
      items.push({
        key: 'tutor',
        label: 'Tutor',
        remaining: tutorRemaining,
      });
    }
    if (summaryRemaining != null) {
      items.push({
        key: 'summary',
        label: 'Resúmenes',
        remaining: summaryRemaining,
      });
    }
    if (standardRemaining != null) {
      items.push({
        key: 'standardPath',
        label: 'Rutas',
        remaining: standardRemaining,
      });
    }
    if (deepRemaining != null) {
      items.push({
        key: 'deepPath',
        label: 'Profundas',
        remaining: deepRemaining,
      });
    }
    return items;
  },
);

export const selectThemeMode = (state: RootState) => (state.user as { themeMode?: string }).themeMode ?? 'system';

export const selectUserBadge = createSelector(
  [selectUserProfile, selectIsVip, selectIsDefaultFreePlan],
  (profile, isVip, isDefaultFreePlan): 'vip' | 'free' | string => {
    if (!profile) return 'free';
    if (isVip) return 'vip';
    if (isDefaultFreePlan) return 'free';
    return profile.planCode ?? 'free';
  },
);
