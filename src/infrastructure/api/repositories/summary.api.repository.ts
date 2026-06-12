import apiClient from '../client';
import type { SummaryRepository } from '../../../domain/repositories/summary.repository.interface';
import type { Summary, SummaryExportFormat } from '../../../domain/entities/summary.entity';

export const summaryApiRepository: SummaryRepository = {
  getAll: async () => {
    const { data } = await apiClient.get<Summary[]>('/v1/summaries');
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.get<Summary>(`/v1/summaries/${id}`);
    return data;
  },

  generateFromText: async (text) => {
    const { data } = await apiClient.post<Summary>('/v1/summaries/generate', { text });
    return data;
  },

  generateFromFile: async (file) => {
    const formData = new FormData();
    formData.append('file', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    const { data } = await apiClient.post<Summary>('/v1/summaries/upload', formData, {
      timeout: 120_000,
    });
    return data;
  },

  delete: async (id) => {
    await apiClient.delete(`/v1/summaries/${id}`);
  },

  export: async (id: string, format: SummaryExportFormat) => {
    const { data } = await apiClient.get<ArrayBuffer>(`/v1/summaries/${id}/export`, {
      params: { format },
      responseType: 'arraybuffer',
    });
    return data;
  },
};
