import { Injectable, Inject } from '@nestjs/common';
import { Tweet, TweetType } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { TweetContent } from '../../domain/value-objects/tweet-content.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TWEET_TOKENS } from '../tokens';

export interface CreateTweetCommand {
  content: string;
  authorId: string;
  type?: TweetType;
  originalTweetId?: string;
  parentTweetId?: string;
}

@Injectable()
export class CreateTweetUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(command: CreateTweetCommand): Promise<Tweet> {
    // Crear value objects
    const tweetId = TweetId.generate();
    const content = new TweetContent(command.content);
    const authorId = new UserId(command.authorId);
    
    // Crear value objects opcionales
    const originalTweetId = command.originalTweetId 
      ? new TweetId(command.originalTweetId) 
      : null;
    const parentTweetId = command.parentTweetId 
      ? new TweetId(command.parentTweetId) 
      : null;

    // Crear tweet usando factory methods del dominio
    let tweet: Tweet;
    
    switch (command.type) {
      case TweetType.RETWEET:
        if (!originalTweetId) {
          throw new Error('Retweets must have an original tweet ID');
        }
        tweet = Tweet.createRetweet(tweetId, content, authorId, originalTweetId);
        break;
        
      case TweetType.REPLY:
        if (!parentTweetId) {
          throw new Error('Replies must have a parent tweet ID');
        }
        tweet = Tweet.createReply(tweetId, content, authorId, parentTweetId);
        break;
        
      default:
        tweet = Tweet.createOriginalTweet(tweetId, content, authorId);
        break;
    }

    // Guardar usando el repositorio
    return await this.tweetRepository.save(tweet);
  }
}