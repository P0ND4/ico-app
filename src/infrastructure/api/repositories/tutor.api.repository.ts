import apiClient from '../client';
import type { TutorRepository } from '../../../domain/repositories/tutor.repository.interface';
import type { TutorConversation, TutorMessage } from '../../../domain/entities/tutor.entity';

export const tutorApiRepository: TutorRepository = {
  getConversations: async () => {
    const { data } = await apiClient.get<TutorConversation[]>('/v1/tutor/conversations');
    return data;
  },

  getConversation: async (id) => {
    const { data } = await apiClient.get<TutorConversation>(`/v1/tutor/conversations/${id}`);
    return data;
  },

  createConversation: async (title) => {
    const { data } = await apiClient.post<TutorConversation>('/v1/tutor/conversations', {
      ...(title && { title }),
    });
    return data;
  },

  updateConversation: async (id, title) => {
    const { data } = await apiClient.patch<TutorConversation>(
      `/v1/tutor/conversations/${id}`,
      { title },
    );
    return data;
  },

  deleteConversation: async (id) => {
    await apiClient.delete(`/v1/tutor/conversations/${id}`);
  },

  getMessages: async (conversationId) => {
    const { data } = await apiClient.get<TutorMessage[]>(
      `/v1/tutor/conversations/${conversationId}/messages`,
    );
    return data;
  },

  sendMessage: async (conversationId, content) => {
    const { data } = await apiClient.post<TutorMessage>(
      `/v1/tutor/conversations/${conversationId}/messages`,
      { content },
    );
    return data;
  },
};
