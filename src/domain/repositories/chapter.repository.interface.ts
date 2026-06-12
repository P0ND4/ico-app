import type { Chapter, CompleteChapterDto, CompleteChapterResult } from '../entities/path.entity';

export interface ChapterRepository {
  getWithLessons(pathId: string, chapterId: string): Promise<Chapter>;
  complete(pathId: string, chapterId: string, dto: CompleteChapterDto): Promise<CompleteChapterResult>;
}
