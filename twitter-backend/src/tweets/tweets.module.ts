import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TweetsService } from './tweets.service';
import { TweetsController } from './tweets.controller';
import { Tweet, TweetSchema } from './schemas/tweet.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

// Application Layer
import { TweetQueryService } from './application/services/tweet-query.service';
import { GetTweetByIdUseCase } from './application/use-cases/get-tweet-by-id.use-case';
import { GetTweetsByAuthorUseCase } from './application/use-cases/get-tweets-by-author.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { TWEET_TOKENS } from './application/tokens';

// Infrastructure Layer
import { MongoTweetRepository } from './infrastructure/database/mongodb/repositories/mongo-tweet.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tweet.name, schema: TweetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [TweetsController],
  providers: [
    // Legacy Service (mantenerlo por ahora para no romper nada)
    TweetsService,
    
    // Application Services
    TweetQueryService,
    
    // Use Cases
    GetTweetByIdUseCase,
    GetTweetsByAuthorUseCase,
    GetRepliesUseCase,
    
    // Infrastructure (Repository Implementation)
    {
      provide: TWEET_TOKENS.TweetRepository,
      useClass: MongoTweetRepository,
    },
    {
      provide: TWEET_TOKENS.TweetQueryService,
      useClass: TweetQueryService,
    },
  ],
  exports: [
    TweetsService,
    TweetQueryService,
    GetTweetByIdUseCase,
    GetTweetsByAuthorUseCase,
    GetRepliesUseCase,
  ],
})
export class TweetsModule {}