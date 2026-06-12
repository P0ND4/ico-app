export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface XpLevel {
  level: number;
  label: string;
  minXp: number;
  maxXp: number;
}

export interface SubscriptionPlan {
  code: string;
  label: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  maxStandardPaths: number | null;
  maxDeepPaths: number | null;
  maxChapters: number | null;
  maxLessons: number | null;
  maxTutorRequests: number | null;
  maxSummaryRequests: number | null;
  adsEnabled: boolean;
  isDefaultFree: boolean;
  isUnlimited: boolean;
  showInPaywall: boolean;
  sortOrder: number;
  quotaResetDays: number | null;
  quotaScope: 'device' | 'user';
  enforceDeviceTrialSlot: boolean;
}
