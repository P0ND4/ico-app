import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PaywallState {
  visible: boolean;
  featureBlocked: string | null;
}

const initialState: PaywallState = {
  visible: false,
  featureBlocked: null,
};

const paywallSlice = createSlice({
  name: 'paywall',
  initialState,
  reducers: {
    openPaywallModal: (state, action: PayloadAction<{ featureBlocked?: string } | undefined>) => {
      state.visible = true;
      state.featureBlocked = action.payload?.featureBlocked ?? null;
    },
    closePaywallModal: (state) => {
      state.visible = false;
      state.featureBlocked = null;
    },
  },
});

export const { openPaywallModal, closePaywallModal } = paywallSlice.actions;
export default paywallSlice.reducer;
