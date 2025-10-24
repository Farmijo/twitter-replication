import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { TWEET_TOKENS } from '../tokens';

export interface DeleteTweetCommand {
  tweetId: string;
  userId: string; // Usuario que intenta eliminar
}

@Injectable()
export class DeleteTweetUseCase {
  constructor(
    @Inject(TWEET_TOKENS.TweetRepository)
    private readonly tweetRepository: TweetRepository,
  ) {}

  async execute(command: DeleteTweetCommand): Promise<void> {
    const tweetId = new TweetId(command.tweetId);
    const userId = new UserId(command.userId);

    // Obtener el tweet
    const tweet = await this.tweetRepository.findById(tweetId);
    
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${command.tweetId} not found`);
    }

    // Verificar que el usuario puede eliminar el tweet
    if (!tweet.canBeDeletedBy(userId)) {
      throw new Error('You can only delete your own tweets');
    }

    // Eliminar el tweet
    await this.tweetRepository.delete(tweetId);
  }
}