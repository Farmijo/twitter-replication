export const TWEET_TOKENS = {
  // Repositories
  TweetRepository: 'TweetRepository',
  
  // Application Services
  TweetQueryService: 'TweetQueryService',
  TimelineService: 'TimelineService',
  
  // Command Use Cases
  CreateTweetUseCase: 'CreateTweetUseCase',
  UpdateTweetUseCase: 'UpdateTweetUseCase',
  DeleteTweetUseCase: 'DeleteTweetUseCase',
  
  // Query Use Cases
  GetTweetByIdUseCase: 'GetTweetByIdUseCase',
  GetTweetsByAuthorUseCase: 'GetTweetsByAuthorUseCase',
  GetRepliesUseCase: 'GetRepliesUseCase',
  GetRecentTweetsUseCase: 'GetRecentTweetsUseCase',
  
  // Read Models (for future complex queries)
  TweetReadModel: 'TweetReadModel',
} as const;