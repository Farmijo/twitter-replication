import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  User,
  UserStats,
  PaginationParams
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, credentials);
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    return apiClient.post<{ access_token: string }>(API_ENDPOINTS.REFRESH, {
      refresh_token: refreshToken,
    });
  },
};

export const userService = {
  async getUserProfile(userId: string): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.USER_PROFILE(userId));
  },

  async getUserStats(userId: string): Promise<UserStats> {
    return apiClient.get<UserStats>(API_ENDPOINTS.USER_STATS(userId));
  },

  async followUser(userId: string): Promise<void> {
    return apiClient.post<void>(API_ENDPOINTS.FOLLOW_USER(userId));
  },

  async unfollowUser(userId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.FOLLOW_USER(userId));
  },

  async getFollowing(userId: string, params?: PaginationParams): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.GET_FOLLOWING(userId), { params });
  },

  async getFollowers(userId: string, params?: PaginationParams): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.GET_FOLLOWERS(userId), { params });
  },

  async isFollowing(userId: string): Promise<{ isFollowing: boolean }> {
    return apiClient.get<{ isFollowing: boolean }>(API_ENDPOINTS.IS_FOLLOWING(userId));
  },
};