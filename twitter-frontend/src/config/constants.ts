// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  
  // Users
  USERS: '/api/users',
  USER_PROFILE: (id: string) => `/api/users/${id}`,
  USER_STATS: (id: string) => `/api/users/${id}/stats`,
  
  // Following system
  FOLLOW_USER: (id: string) => `/api/users/${id}/follow`,
  GET_FOLLOWING: (id: string) => `/api/users/${id}/following`,
  GET_FOLLOWERS: (id: string) => `/api/users/${id}/followers`,
  IS_FOLLOWING: (id: string) => `/api/users/${id}/is-following`,
  
  // Tweets
  TWEETS: '/api/tweets',
  TWEET_BY_ID: (id: string) => `/api/tweets/${id}`,
  USER_TWEETS: (userId: string) => `/api/tweets/user/${userId}`,
} as const;

// Token storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'twitter_access_token',
  REFRESH_TOKEN: 'twitter_refresh_token',
  USER_DATA: 'twitter_user_data',
} as const;