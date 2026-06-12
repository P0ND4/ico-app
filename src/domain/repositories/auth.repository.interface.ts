import type { AuthResponse } from '../entities/auth.entity';

export interface AuthRepository {
  loginWithGoogle(idToken: string, deviceId?: string): Promise<AuthResponse>;
  loginWithApple(identityToken: string, fullName?: string, deviceId?: string): Promise<AuthResponse>;
  loginAsGuest(deviceId?: string): Promise<AuthResponse>;
  refresh(refreshToken: string): Promise<AuthResponse>;
  logout(refreshToken?: string): Promise<void>;
  linkGoogle(idToken: string): Promise<void>;
  linkApple(identityToken: string, fullName?: string): Promise<void>;
}
