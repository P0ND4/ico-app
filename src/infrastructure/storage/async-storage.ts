import AsyncStorage from '@react-native-async-storage/async-storage';

export { AsyncStorage };

const PENDING_JOB_KEY = 'ico_pending_job';

export interface PendingJob {
  jobId: string;
  pathId: string;
  topic: string;
  mode: string;
  startedAt: number;
}

export const pendingJobStorage = {
  save: (job: PendingJob): Promise<void> =>
    AsyncStorage.setItem(PENDING_JOB_KEY, JSON.stringify(job)),

  get: async (): Promise<PendingJob | null> => {
    const raw = await AsyncStorage.getItem(PENDING_JOB_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as PendingJob; } catch { return null; }
  },

  clear: (): Promise<void> =>
    AsyncStorage.removeItem(PENDING_JOB_KEY),
};
