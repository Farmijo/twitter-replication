import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Tweet } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { AuthorId } from '../../domain/value-objects/author-id.vo';
import { TWEET_TOKENS } from '../tokens';

export interface UpdateTweetCommand {
  tweetId: string;
  userId: string; // Usuario que intenta actualizar
  newContent: string;
}

@Injectable()
export class UpdateTweetUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(command: UpdateTweetCommand): Promise<Tweet> {
    const tweetId = new TweetId(command.tweetId);
    const authorId = AuthorId.fromString(command.userId);

    const tweet = await this.tweetRepository.findById(tweetId);
    
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${command.tweetId} not found`);
    }

    if (!tweet.canBeEditedBy(authorId)) {
      throw new Error('You can only edit your own tweets and only within 5 minutes of creation');
    }

    tweet.updateContent(command.newContent);

    return await this.tweetRepository.update(tweet);
  }
}