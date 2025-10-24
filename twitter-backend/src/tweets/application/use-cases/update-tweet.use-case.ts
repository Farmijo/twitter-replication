import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Tweet } from '../../domain/entities/tweet.entity';
import { TweetRepository } from '../../domain/repositories/tweet.repository';
import { TweetId } from '../../domain/value-objects/tweet-id.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
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
    const userId = new UserId(command.userId);

    // Obtener el tweet
    const tweet = await this.tweetRepository.findById(tweetId);
    
    if (!tweet) {
      throw new NotFoundException(`Tweet with id ${command.tweetId} not found`);
    }

    // Verificar que el usuario puede editar el tweet
    if (!tweet.canBeEditedBy(userId)) {
      throw new Error('You can only edit your own tweets and only within 5 minutes of creation');
    }

    // Actualizar el contenido usando el método del dominio
    tweet.updateContent(command.newContent);

    // Guardar los cambios
    return await this.tweetRepository.update(tweet);
  }
}