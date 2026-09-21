export type CouponGrantType = 'quota_bonus' | 'vip_access' | 'plan_upgrade';

/** A coupon redemption as returned by the API. Fields that may be renamed backend-side are optional. */
export interface CouponRedemption {
  id: string;
  code: string;
  label?: string | null;
  grantType?: CouponGrantType | string | null;
  effectSummary?: string | null;
  grantedUntil?: string | null;
  redeemedAt?: string | null;
}

/** Result of `POST /v1/coupons/redeem`. Only `redemption` is guaranteed. */
export interface CouponRedeemResult {
  redemption: CouponRedemption;
  planCode?: string | null;
  planExpiresAt?: string | null;
  isVip?: boolean | null;
  vipExpiresAt?: string | null;
  bonusTutorRemaining?: number | null;
  bonusSummaryRemaining?: number | null;
  bonusStandardPathRemaining?: number | null;
  bonusDeepPathRemaining?: number | null;
}

/** Normalizes a user-typed code the same way the backend does. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** A redemption is active when it has no expiry date or it is still in the future. */
export function isRedemptionActive(
  redemption: CouponRedemption,
  now: number = Date.now(),
): boolean {
  if (!redemption.grantedUntil) return true;
  const until = Date.parse(redemption.grantedUntil);
  if (Number.isNaN(until)) return true;
  return until > now;
}
