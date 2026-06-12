import type { Chapter, LearningPath } from '../../domain/entities/path.entity';

type PathProgressInput = Pick<
  LearningPath,
  'status' | 'completedChapterCount' | 'chapterCount'
>;

/** Progress by chapters completed — not XP earned (partial quiz scores can be < 100% XP). */
export function getPathProgressPercent(
  path: PathProgressInput,
  chapters?: Pick<Chapter, 'status'>[],
): number {
  if (path.status === 'completed') return 100;

  const totalCount = path.chapterCount ?? chapters?.length ?? 0;
  const completedCount =
    path.completedChapterCount ??
    chapters?.filter((c) => c.status === 'completed').length ??
    0;

  if (totalCount <= 0) return 0;
  if (completedCount >= totalCount) return 100;

  return Math.round((completedCount / totalCount) * 100);
}
