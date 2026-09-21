export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveAt: string | null;
  currentLevelMinXp?: number;
  nextLevelMinXp?: number;
  planCode?: string;
  planLabel?: string;
  isDefaultFreePlan?: boolean;
  isUnlimitedPlan?: boolean;
  adsEnabled?: boolean;
  isVip?: boolean;
  freeTrialUsed?: boolean;
  trialTutorRemaining?: number | null;
  trialSummaryRemaining?: number | null;
  trialStandardPathRemaining?: number | null;
  trialDeepPathRemaining?: number | null;
  tutorRequestLimit?: number | null;
  summaryRequestLimit?: number | null;
  standardPathLimit?: number | null;
  deepPathLimit?: number | null;
  quotaRenewsAt?: string | null;
  trialExhausted?: boolean;
  // Coupon-granted access. Optional: added by the coupon feature, may be absent
  // on older backends. `trialXxxRemaining` above already includes the bonus.
  vipExpiresAt?: string | null;
  planExpiresAt?: string | null;
  hasQuotaBonus?: boolean;
  bonusTutorRemaining?: number | null;
  bonusSummaryRemaining?: number | null;
  bonusStandardPathRemaining?: number | null;
  bonusDeepPathRemaining?: number | null;
  themeMode?: string;
  learningStyle?: string | null;
  coursePreferences?: string | null;
  learningNotes?: string | null;
}

export interface UserStats {
  totalStudyMinutes: number;
  pathsCompleted: number;
  chaptersCompleted: number;
  lessonsCompleted: number;
  correctAnswers: number;
  totalQuestionAnswers: number;
  pomodoroSessionsDone: number;
  correctAnswerRate: number;
}
