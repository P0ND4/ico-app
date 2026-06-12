import apiClient from '../client';
import type { LessonRepository } from '../../../domain/repositories/lesson.repository.interface';
import type { RecordAnswerDto } from '../../../domain/entities/path.entity';

export const lessonApiRepository: LessonRepository = {
  recordAnswer: async (pathId, chapterId, lessonId, dto: RecordAnswerDto) => {
    await apiClient.post(
      `/v1/paths/${pathId}/chapters/${chapterId}/lessons/${lessonId}/answer`,
      dto,
    );
  },
};
