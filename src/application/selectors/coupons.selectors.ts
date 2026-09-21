import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store/index';
import type { CouponRedemption } from '../../domain/entities/coupon.entity';
import { isRedemptionActive } from '../../domain/entities/coupon.entity';

export const selectCouponRedemptions = (state: RootState): CouponRedemption[] =>
  state.coupons.redemptions;

export const selectCouponHistoryStatus = (state: RootState) => state.coupons.historyStatus;
export const selectCouponRedeemStatus = (state: RootState) => state.coupons.redeemStatus;
export const selectCouponError = (state: RootState) => state.coupons.error;
export const selectLastCouponRedeemed = (state: RootState) => state.coupons.lastRedeemed;

export const selectIsRedeemingCoupon = (state: RootState) =>
  state.coupons.redeemStatus === 'redeeming';

/** Newest first — the API order is not guaranteed. */
export const selectSortedCouponRedemptions = createSelector(
  [selectCouponRedemptions],
  (redemptions) =>
    [...redemptions].sort((a, b) => {
      const aTime = a.redeemedAt ? Date.parse(a.redeemedAt) : 0;
      const bTime = b.redeemedAt ? Date.parse(b.redeemedAt) : 0;
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    }),
);

export const selectActiveCouponRedemptions = createSelector(
  [selectSortedCouponRedemptions],
  (redemptions) => redemptions.filter((redemption) => isRedemptionActive(redemption)),
);

export const selectHasCouponRedemptions = createSelector(
  [selectCouponRedemptions],
  (redemptions) => redemptions.length > 0,
);

/* --- Coupon-granted access, derived from the profile --- */

export const selectVipExpiresAt = (state: RootState): string | null =>
  state.user.profile?.vipExpiresAt ?? null;

export const selectPlanExpiresAt = (state: RootState): string | null =>
  state.user.profile?.planExpiresAt ?? null;

export const selectHasQuotaBonus = (state: RootState): boolean => {
  const profile = state.user.profile;
  if (profile?.hasQuotaBonus != null) return profile.hasQuotaBonus;
  return (
    (profile?.bonusTutorRemaining ?? 0) > 0 ||
    (profile?.bonusSummaryRemaining ?? 0) > 0 ||
    (profile?.bonusStandardPathRemaining ?? 0) > 0 ||
    (profile?.bonusDeepPathRemaining ?? 0) > 0
  );
};
