import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TweetModel, TweetSchema } from './infrastructure/database/mongodb/models/tweet.model';
import { User, UserSchema } from '../users/schemas/user.schema';

// Hexagonal Architecture - Controllers
import { TweetsController } from './controllers/tweets.controller';

// Application Layer - Services
import { TweetQueryService } from './application/services/tweet-query.service';

// Application Layer - Use Cases (Commands)
import { CreateTweetUseCase } from './application/use-cases/create-tweet.use-case';
import { UpdateTweetUseCase } from './application/use-cases/update-tweet.use-case';
import { DeleteTweetUseCase } from './application/use-cases/delete-tweet.use-case';

// Application Layer - Use Cases (Queries)
import { GetTweetByIdUseCase } from './application/use-cases/get-tweet-by-id.use-case';
import { GetTweetsByAuthorUseCase } from './application/use-cases/get-tweets-by-author.use-case';
import { GetRepliesUseCase } from './application/use-cases/get-replies.use-case';
import { GetRecentTweetsUseCase } from './application/use-cases/get-recent-tweets.use-case';

// Infrastructure Layer
import { MongoTweetRepository } from './infrastructure/database/mongodb/repositories/mongo-tweet.repository';

// Tokens
import { TWEET_TOKENS } from './application/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tweet', schema: TweetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    TweetsController,
  ],
  providers: [
    // Application Services
    TweetQueryService,
    
    // Command Use Cases
    CreateTweetUseCase,
    UpdateTweetUseCase,
    DeleteTweetUseCase,
    
    // Query Use Cases
    GetTweetByIdUseCase,
    GetTweetsByAuthorUseCase,
    GetRepliesUseCase,
  GetRecentTweetsUseCase,
    
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
    // Hexagonal exports
    TweetQueryService,
    CreateTweetUseCase,
    UpdateTweetUseCase,
    DeleteTweetUseCase,
    GetTweetByIdUseCase,
    GetTweetsByAuthorUseCase,
    GetRepliesUseCase,
    GetRecentTweetsUseCase,
  ],
})
export class TweetsModule {}