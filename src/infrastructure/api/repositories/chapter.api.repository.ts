import apiClient from '../client';
import type { ChapterRepository } from '../../../domain/repositories/chapter.repository.interface';
import type { Chapter, CompleteChapterDto, CompleteChapterResult } from '../../../domain/entities/path.entity';

export interface ExamEvaluationResult {
  score: number;
  passed: boolean;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export const chapterApiRepository: ChapterRepository = {
  getWithLessons: async (pathId, chapterId) => {
    const { data } = await apiClient.get<Chapter>(
      `/v1/paths/${pathId}/chapters/${chapterId}`,
    );
    return data;
  },

  complete: async (pathId, chapterId, dto: CompleteChapterDto) => {
    const { data } = await apiClient.post<CompleteChapterResult>(
      `/v1/paths/${pathId}/chapters/${chapterId}/complete`,
      dto,
    );
    return data;
  },
};

export async function evaluateExam(
  pathId: string,
  chapterId: string,
  answers: Array<{ lessonId: string; text: string }>,
): Promise<ExamEvaluationResult> {
  const { data } = await apiClient.post<ExamEvaluationResult>(
    `/v1/paths/${pathId}/chapters/${chapterId}/evaluate-exam`,
    { answers },
  );
  return data;
}
