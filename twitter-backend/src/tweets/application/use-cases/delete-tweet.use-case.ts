import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { AuthorId } from '../../domain/value-objects/author-id.vo';
import { TWEET_TOKENS } from '../tokens';

export interface DeleteTweetCommand {
  tweetId: string;
  userId: string;
}

@Injectable()
export class DeleteTweetUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(command: DeleteTweetCommand): Promise<void> {
    const tweetId = new TweetId(command.tweetId);
    const authorId = AuthorId.fromString(command.userId);

    const tweet = await this.tweetRepository.findById(tweetId);
    
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${command.tweetId} not found`);
    }

    if (!tweet.canBeDeletedBy(authorId)) {
      throw new Error('You can only delete your own tweets');
    }

    await this.tweetRepository.delete(tweetId);
  }
}