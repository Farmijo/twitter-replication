import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './infrastructure/http/controllers/users.controller';
import { UserModel, UserSchema } from './infrastructure/database/mongodb/models/user.model';
import { FollowModel, FollowSchema } from './infrastructure/database/mongodb/models/follow.model';
import { USERS_TOKENS } from './application/tokens';
import { MongoUserRepository } from './infrastructure/database/mongodb/repositories/mongo-user.repository';
import { MongoFollowRepository } from './infrastructure/database/mongodb/repositories/mongo-follow.repository';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { GetUserByUsernameUseCase } from './application/use-cases/get-user-by-username.use-case';
import { GetUserByEmailUseCase } from './application/use-cases/get-user-by-email.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { GetFollowingUseCase } from './application/use-cases/get-following.use-case';
import { GetFollowersUseCase } from './application/use-cases/get-followers.use-case';
import { IsFollowingUseCase } from './application/use-cases/is-following.use-case';
import { GetUserStatsUseCase } from './application/use-cases/get-user-stats.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: FollowModel.name, schema: FollowSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    // Repositories
    {
      provide: USERS_TOKENS.UserRepository,
      useClass: MongoUserRepository,
    },
    {
      provide: USERS_TOKENS.FollowRepository,
      useClass: MongoFollowRepository,
    },
    // Use cases
    GetUsersUseCase,
    GetUserByIdUseCase,
    GetUserByUsernameUseCase,
    GetUserByEmailUseCase,
    DeleteUserUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    GetFollowingUseCase,
    GetFollowersUseCase,
    IsFollowingUseCase,
    GetUserStatsUseCase,
  ],
  exports: [USERS_TOKENS.UserRepository, USERS_TOKENS.FollowRepository],
})
export class UsersModule {}