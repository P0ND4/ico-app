import type { User, UserStats } from '../entities/user.entity';

export interface UpdateUserDto {
  name?: string | null;
  avatarUrl?: string | null;
  themeMode?: string;
}

export interface UserRepository {
  getProfile(): Promise<User>;
  updateProfile(dto: UpdateUserDto): Promise<User>;
  deleteAccount(): Promise<void>;
  getStats(): Promise<UserStats>;
}
