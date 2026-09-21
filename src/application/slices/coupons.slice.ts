import { createSlice } from '@reduxjs/toolkit';
import type { CouponRedeemResult, CouponRedemption } from '../../domain/entities/coupon.entity';
import { fetchCouponHistory, redeemCoupon } from '../thunks/coupons.thunks';

export interface CouponsState {
  redemptions: CouponRedemption[];
  historyStatus: 'idle' | 'loading' | 'error';
  redeemStatus: 'idle' | 'redeeming' | 'error';
  error: string | null;
  lastRedeemed: CouponRedeemResult | null;
}

const initialState: CouponsState = {
  redemptions: [],
  historyStatus: 'idle',
  redeemStatus: 'idle',
  error: null,
  lastRedeemed: null,
};

const couponsSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearCouponFeedback: (state) => {
      state.error = null;
      state.lastRedeemed = null;
      if (state.redeemStatus === 'error') state.redeemStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(redeemCoupon.pending, (state) => {
        state.redeemStatus = 'redeeming';
        state.error = null;
        state.lastRedeemed = null;
      })
      .addCase(redeemCoupon.fulfilled, (state, action) => {
        state.redeemStatus = 'idle';
        state.error = null;
        state.lastRedeemed = action.payload;
        const redemption = action.payload.redemption;
        if (redemption) {
          state.redemptions = [
            redemption,
            ...state.redemptions.filter((item) => item.id !== redemption.id),
          ];
        }
      })
      .addCase(redeemCoupon.rejected, (state, action) => {
        state.redeemStatus = 'error';
        state.lastRedeemed = null;
        state.error = action.payload ?? 'No se pudo canjear el cupón. Inténtalo de nuevo.';
      })
      .addCase(fetchCouponHistory.pending, (state) => {
        state.historyStatus = 'loading';
      })
      .addCase(fetchCouponHistory.fulfilled, (state, action) => {
        state.historyStatus = 'idle';
        state.redemptions = action.payload;
      })
      .addCase(fetchCouponHistory.rejected, (state) => {
        state.historyStatus = 'error';
      });
  },
});

export const { clearCouponFeedback } = couponsSlice.actions;
export default couponsSlice.reducer;
