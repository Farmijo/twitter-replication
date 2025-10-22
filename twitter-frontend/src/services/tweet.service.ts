import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/config/constants';
import { Tweet, CreateTweetData, PaginationParams, TweetsResponse, CreateTweetResponse } from '@/types';

export const tweetService = {
  async getAllTweets(params?: PaginationParams): Promise<Tweet[]> {
    const response = await apiClient.get<TweetsResponse>(API_ENDPOINTS.TWEETS, { params });
    return response.data; // Extraemos solo el array de tweets
  },

  async getTweetById(tweetId: string): Promise<Tweet> {
    return apiClient.get<Tweet>(API_ENDPOINTS.TWEET_BY_ID(tweetId));
  },

  async getUserTweets(userId: string, params?: PaginationParams): Promise<Tweet[]> {
    const response = await apiClient.get<TweetsResponse>(API_ENDPOINTS.USER_TWEETS(userId), { params });
    return response.data; // Extraemos solo el array de tweets
  },

  async createTweet(tweetData: CreateTweetData): Promise<Tweet> {
    const response = await apiClient.post<CreateTweetResponse>(API_ENDPOINTS.TWEETS, tweetData);
    return response.data; // Extraemos solo el tweet del data
  },

  async deleteTweet(tweetId: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.TWEET_BY_ID(tweetId));
  },
};