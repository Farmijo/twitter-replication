import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TweetQueryService } from '../services/tweet-query.service';
import { TWEET_TOKENS } from '../tokens';

@Injectable()
export class GetTweetByIdUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetQueryService)
    private readonly tweetQueryService: TweetQueryService,
  ) {}

  async execute(id: string) {
    const tweet = await this.tweetQueryService.getTweetById(id);
    console.log(tweet);
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${id} not found`);
    }

    return {
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
    };
  }
}