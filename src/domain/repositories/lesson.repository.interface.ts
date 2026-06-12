import type { RecordAnswerDto } from '../entities/path.entity';

export interface LessonRepository {
  recordAnswer(pathId: string, chapterId: string, lessonId: string, dto: RecordAnswerDto): Promise<void>;
}
