import apiClient from '../client';
import type { CouponRepository } from '../../../domain/repositories/coupon.repository.interface';
import type { CouponRedeemResult, CouponRedemption } from '../../../domain/entities/coupon.entity';
import { normalizeCouponCode } from '../../../domain/entities/coupon.entity';

export const couponApiRepository: CouponRepository = {
  redeem: async (code: string) => {
    const { data } = await apiClient.post<CouponRedeemResult>('/v1/coupons/redeem', {
      code: normalizeCouponCode(code),
    });
    return data;
  },

  getMyRedemptions: async () => {
    const { data } = await apiClient.get<CouponRedemption[]>('/v1/coupons/mine');
    return Array.isArray(data) ? data : [];
  },
};
