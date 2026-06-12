import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store/index';
import type { SubscriptionPlan } from '../../domain/entities/catalog.entity';

export const selectSubscriptionPlans = (state: RootState) => state.catalog.subscriptionPlans;

export const selectFreePlan = createSelector(
  [selectSubscriptionPlans],
  (plans): SubscriptionPlan | null =>
    plans.find((p) => p.isDefaultFree) ?? plans.find((p) => p.code === 'free') ?? null,
);

export const selectPaywallPlans = createSelector(
  [selectSubscriptionPlans],
  (plans): SubscriptionPlan[] => {
    const visible = [...plans.filter((p) => p.showInPaywall)].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (visible.length > 0) return visible;

    return [...plans.filter((p) => !p.isDefaultFree)].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  },
);

export const selectPlanByCode = (code: string) =>
  createSelector(
    [selectSubscriptionPlans],
    (plans): SubscriptionPlan | null => plans.find((p) => p.code === code) ?? null,
  );

/** @deprecated Use selectPaywallPlans or selectPlanByCode */
export const selectPremiumPlan = createSelector(
  [selectSubscriptionPlans],
  (plans): SubscriptionPlan | null =>
    plans.find((p) => p.isUnlimited) ?? plans.find((p) => p.code === 'premium') ?? null,
);
