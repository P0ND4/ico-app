import { createAsyncThunk } from '@reduxjs/toolkit';
import { couponApiRepository } from '../../infrastructure/api/repositories/coupon.api.repository';
import {
  getCouponHistoryErrorMessage,
  getRedeemCouponErrorMessage,
} from '../../infrastructure/api/coupon-error.utils';
import type { CouponRedeemResult, CouponRedemption } from '../../domain/entities/coupon.entity';
import { fetchProfile } from './user.thunks';

export const redeemCoupon = createAsyncThunk<
  CouponRedeemResult,
  string,
  { rejectValue: string }
>('coupons/redeem', async (code, { dispatch, rejectWithValue }) => {
  try {
    const result = await couponApiRepository.redeem(code);
    // The profile carries every quota, VIP and plan field the UI derives from.
    await dispatch(fetchProfile());
    return result;
  } catch (err) {
    return rejectWithValue(getRedeemCouponErrorMessage(err));
  }
});

export const fetchCouponHistory = createAsyncThunk<
  CouponRedemption[],
  void,
  { rejectValue: string }
>('coupons/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    return await couponApiRepository.getMyRedemptions();
  } catch (err) {
    return rejectWithValue(getCouponHistoryErrorMessage(err));
  }
});
