import { Injectable, Inject } from '@nestjs/common';
import { Tweet } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { AuthorId } from '../../domain/value-objects/author-id.vo';
import { TWEET_TOKENS } from '../tokens';

@Injectable()
export class TweetQueryService {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}


  async getTweetById(id: string): Promise<Tweet | null> {
    const tweetId = new TweetId(id);
    return this.tweetRepository.findById(tweetId);
  }

  async getTweetsByIds(ids: string[]): Promise<Tweet[]> {
    const tweetIds = ids.map(id => new TweetId(id));
    return this.tweetRepository.findByIds(tweetIds);
  }

  async getTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    const author = AuthorId.fromString(authorId);
    return this.tweetRepository.findByAuthor(author);
  }

  async getRecentTweets(limit = 20, skip = 0): Promise<Tweet[]> {
    return this.tweetRepository.findRecent(limit, skip);
  }

  async getRepliesTo(tweetId: string): Promise<Tweet[]> {
    const tweet = new TweetId(tweetId);
    return this.tweetRepository.findRepliesTo(tweet);
  }

  async tweetExists(id: string): Promise<boolean> {
    const tweet = await this.getTweetById(id);
    return tweet !== null;
  }
}