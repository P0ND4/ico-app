import type { Tag, XpLevel, SubscriptionPlan } from '../entities/catalog.entity';

export interface CatalogRepository {
  getTags(): Promise<Tag[]>;
  getXpLevels(): Promise<XpLevel[]>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
}
