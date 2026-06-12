import type { User, UserStats } from '../entities/user.entity';

export interface UpdateUserDto {
  name?: string | null;
  avatarUrl?: string | null;
  themeMode?: string;
  learningStyle?: string | null;
  coursePreferences?: string | null;
  learningNotes?: string | null;
}

export interface UserRepository {
  getProfile(): Promise<User>;
  updateProfile(dto: UpdateUserDto): Promise<User>;
  deleteAccount(): Promise<void>;
  getStats(): Promise<UserStats>;
}
