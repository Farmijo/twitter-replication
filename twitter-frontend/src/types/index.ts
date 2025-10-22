export interface User {
  id: string;
  username: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
  following?: string[];
  followers?: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
    message: string;
    data: User;
}

export interface Tweet {
  id: string;
  content: string;
  userId: User | string; // En GET viene populated, en POST viene como string
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  hashtags: string[];
  mentions: string[];
  isRetweet: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number; // Opcional porque no viene en POST response
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface TweetsResponse {
  message: string;
  data: Tweet[];
  count: number;
  pagination: {
    limit: number;
    skip: number;
  };
}

export interface CreateTweetResponse {
  message: string;
  data: Tweet;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  followingCount: number;
  followersCount: number;
  tweetsCount: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface CreateTweetData {
  content: string;
}

export interface PaginationParams {
  limit?: number;
  skip?: number;
}