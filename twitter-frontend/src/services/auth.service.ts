import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants';
import { 
  ApiResponse,
  AuthResponse, 
  FollowActionResponse,
  FollowListResult,
  FollowListResponse,
  FollowStatusResponse,
  LoginCredentials, 
  PaginationParams,
  RegisterCredentials,
  UserResponse,
  UserStats,
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
  async getUserProfile(userId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(API_ENDPOINTS.USER_PROFILE(userId));
  },

  async getUserStats(userId: string): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>(API_ENDPOINTS.USER_STATS(userId));
    const stats = response.data ?? { followersCount: 0, followingCount: 0 };

    return {
      followersCount: stats.followersCount ?? 0,
      followingCount: stats.followingCount ?? 0,
      tweetsCount: stats.tweetsCount ?? 0,
    };
  },

  async followUser(userId: string): Promise<FollowActionResponse> {
    return apiClient.post<FollowActionResponse>(API_ENDPOINTS.FOLLOW_USER(userId));
  },

  async unfollowUser(userId: string): Promise<FollowActionResponse> {
    return apiClient.delete<FollowActionResponse>(API_ENDPOINTS.FOLLOW_USER(userId));
  },

  async getFollowing(userId: string, params?: PaginationParams): Promise<FollowListResult> {
    const response = await apiClient.get<FollowListResponse>(API_ENDPOINTS.GET_FOLLOWING(userId), { params });

    return {
      message: response.message,
      users: response.data,
      pagination: response.pagination,
    };
  },

  async getFollowers(userId: string, params?: PaginationParams): Promise<FollowListResult> {
    const response = await apiClient.get<FollowListResponse>(API_ENDPOINTS.GET_FOLLOWERS(userId), { params });

    return {
      message: response.message,
      users: response.data,
      pagination: response.pagination,
    };
  },

  async isFollowing(userId: string): Promise<FollowStatusResponse> {
    return apiClient.get<FollowStatusResponse>(API_ENDPOINTS.IS_FOLLOWING(userId));
  },
};