import type { CouponRedeemResult, CouponRedemption } from '../entities/coupon.entity';

export interface CouponRepository {
  redeem(code: string): Promise<CouponRedeemResult>;
  getMyRedemptions(): Promise<CouponRedemption[]>;
}
