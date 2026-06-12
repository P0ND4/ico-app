import apiClient from '../client';
import type { UserRepository, UpdateUserDto } from '../../../domain/repositories/user.repository.interface';
import type { User, UserStats } from '../../../domain/entities/user.entity';

export const userApiRepository: UserRepository = {
  getProfile: async () => {
    const { data } = await apiClient.get<User>('/v1/users/me');
    return data;
  },

  updateProfile: async (dto: UpdateUserDto) => {
    const { data } = await apiClient.patch<User>('/v1/users/me', dto);
    return data;
  },

  deleteAccount: async () => {
    await apiClient.delete('/v1/users/me');
  },

  getStats: async () => {
    const { data } = await apiClient.get<UserStats>('/v1/stats');
    return data;
  },
};
