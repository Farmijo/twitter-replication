import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

export interface UnfollowUserResult {
  message: string;
  following: boolean;
}

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(USERS_TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(followerIdRaw: string, followeeIdRaw: string): Promise<UnfollowUserResult> {
    if (followerIdRaw === followeeIdRaw) {
      throw new BusinessRuleException('Cannot unfollow yourself');
    }

    const followerId = UserId.fromString(followerIdRaw);
    const followeeId = UserId.fromString(followeeIdRaw);

    const [follower, followee] = await Promise.all([
      this.userRepository.findById(followerId),
      this.userRepository.findById(followeeId),
    ]);

    if (!follower) {
      throw new NotFoundDomainException('Follower user', followerIdRaw);
    }

    if (!followee) {
      throw new NotFoundDomainException('User to unfollow', followeeIdRaw);
    }

    const deleted = await this.followRepository.delete(followerId, followeeId);
    if (!deleted) {
      throw new BusinessRuleException('Not following this user');
    }

    await Promise.all([
      this.userRepository.incrementFollowingCount(followerId, -1),
      this.userRepository.incrementFollowersCount(followeeId, -1),
    ]);

    return {
      message: 'User unfollowed successfully',
      following: false,
    };
  }
}
