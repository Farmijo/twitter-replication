import { Injectable, Inject } from '@nestjs/common';
import { TweetQueryService } from '../services/tweet-query.service';
import { TWEET_TOKENS } from '../tokens';

@Injectable()
export class GetTweetsByAuthorUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetQueryService)
    private readonly tweetQueryService: TweetQueryService,
  ) {}

  async execute(authorId: string) {
    const tweets = await this.tweetQueryService.getTweetsByAuthor(authorId);

    return tweets.map(tweet => ({
      id: tweet.getId().getValue(),
      content: tweet.getContent(),
      authorId: tweet.getAuthorId().getValue(),
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