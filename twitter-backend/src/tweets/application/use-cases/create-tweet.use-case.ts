import { Injectable, Inject } from '@nestjs/common';
import { Tweet, TweetType } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { TweetContent } from '../../domain/value-objects/tweet-content.vo';
import { AuthorId } from '../../domain/value-objects/author-id.vo';
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
    const tweetId = TweetId.generate();
    const content = new TweetContent(command.content);
    const authorId = AuthorId.fromString(command.authorId);
    
    //Checkout retweet and reply IDs
    const originalTweetId = command.originalTweetId 
      ? new TweetId(command.originalTweetId) 
      : null;
    const parentTweetId = command.parentTweetId 
      ? new TweetId(command.parentTweetId) 
      : null;

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