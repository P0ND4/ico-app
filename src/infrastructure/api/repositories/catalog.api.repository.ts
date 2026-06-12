import apiClient from '../client';
import type { CatalogRepository } from '../../../domain/repositories/catalog.repository.interface';
import type { Tag, XpLevel, SubscriptionPlan } from '../../../domain/entities/catalog.entity';
import { normalizeSubscriptionPlan } from '../mappers/subscription-plan.mapper';

export const catalogApiRepository: CatalogRepository = {
  getTags: async () => {
    const { data } = await apiClient.get<Tag[]>('/catalog/tags');
    return data;
  },

  getXpLevels: async () => {
    const { data } = await apiClient.get<XpLevel[]>('/catalog/xp-levels');
    return data;
  },

  getSubscriptionPlans: async () => {
    const { data } = await apiClient.get<Record<string, unknown>[]>('/catalog/subscription-plans');
    return data.map((row) => normalizeSubscriptionPlan(row));
  },
};
