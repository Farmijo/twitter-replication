import { Injectable, Inject } from '@nestjs/common';
import { Tweet } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TWEET_TOKENS } from '../tokens';

@Injectable()
export class TweetQueryService {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}

  /**
   * Obtener un tweet por su ID
   */
  async getTweetById(id: string): Promise<Tweet | null> {
    const tweetId = new TweetId(id);
    return this.tweetRepository.findById(tweetId);
  }

  /**
   * Obtener múltiples tweets por sus IDs
   */
  async getTweetsByIds(ids: string[]): Promise<Tweet[]> {
    const tweetIds = ids.map(id => new TweetId(id));
    return this.tweetRepository.findByIds(tweetIds);
  }

  /**
   * Obtener tweets de un usuario específico
   */
  async getTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    const userId = new UserId(authorId);
    return this.tweetRepository.findByAuthor(userId);
  }

  /**
   * Obtener respuestas a un tweet específico
   */
  async getRepliesTo(tweetId: string): Promise<Tweet[]> {
    const tweet = new TweetId(tweetId);
    return this.tweetRepository.findRepliesTo(tweet);
  }

  /**
   * Verificar si un tweet existe
   */
  async tweetExists(id: string): Promise<boolean> {
    const tweet = await this.getTweetById(id);
    return tweet !== null;
  }
}