import { Inject, Injectable } from '@nestjs/common';
import { TweetQueryService } from '../services/tweet-query.service';
import { TWEET_TOKENS } from '../tokens';

@Injectable()
export class GetRecentTweetsUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetQueryService)
    private readonly tweetQueryService: TweetQueryService,
  ) {}

  async execute(limit = 20, skip = 0) {
    const tweets = await this.tweetQueryService.getRecentTweets(limit, skip);

    return tweets.map(tweet => ({
      id: tweet.getId().getValue(),
      content: tweet.getContent(),
      authorId: tweet.getAuthorId().getValue(),
      author: tweet.getAuthorSnapshot(),
      type: tweet.getType(),
      likesCount: tweet.getLikesCount(),
      retweetsCount: tweet.getRetweetsCount(),
      repliesCount: tweet.getRepliesCount(),
      hashtags: tweet.getHashtags(),
      mentions: tweet.getMentions(),
      createdAt: tweet.getCreatedAt(),
      originalTweetId: tweet.getOriginalTweetId()?.getValue() || null,
      parentTweetId: tweet.getParentTweetId()?.getValue() || null,
    }));
  }
}
