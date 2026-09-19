import apiClient from '../client';
import type { PathRepository, UpdatePathDto } from '../../../domain/repositories/path.repository.interface';
import type { LearningPath, GeneratePathDto, PathGenerationJob } from '../../../domain/entities/path.entity';

export const pathApiRepository: PathRepository = {
  getAll: async (includeDeleted = false) => {
    const { data } = await apiClient.get<LearningPath[]>('/v1/paths', {
      params: includeDeleted ? { includeDeleted: 'true' } : undefined,
    });
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get<LearningPath>(`/v1/paths/${id}`);
    return data;
  },

  generate: async (dto: GeneratePathDto) => {
    const { data } = await apiClient.post<PathGenerationJob>('/v1/paths/generate', dto);
    return data;
  },

  getJob: async (jobId) => {
    const { data } = await apiClient.get<PathGenerationJob>(`/v1/paths/jobs/${jobId}`);
    return data;
  },

  update: async (id, dto: UpdatePathDto) => {
    const { data } = await apiClient.patch<LearningPath>(`/v1/paths/${id}`, dto);
    return data;
  },

  delete: async (id) => {
    await apiClient.delete(`/v1/paths/${id}`);
  },

  restore: async (id) => {
    const { data } = await apiClient.post<LearningPath>(`/v1/paths/${id}/restore`);
    return data;
  },

  askTutor: async (pathId, body) => {
    const { data } = await apiClient.post<{ answer: string }>(`/v1/paths/${pathId}/tutor`, body);
    return data;
  },
};
