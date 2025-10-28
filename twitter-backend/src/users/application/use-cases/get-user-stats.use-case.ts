import { Inject, Injectable } from '@nestjs/common';
import { UserStatsDto } from '../dto/user-stats.dto';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    @Inject(USERS_TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(userIdRaw: string): Promise<UserStatsDto> {
    const userId = UserId.fromString(userIdRaw);
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.countFollowers(userId),
      this.followRepository.countFollowing(userId),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }
}
