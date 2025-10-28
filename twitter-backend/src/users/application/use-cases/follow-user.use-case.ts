import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException, NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

export interface FollowUserResult {
  message: string;
  following: boolean;
}

@Injectable()
export class FollowUserUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(USERS_TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(followerIdRaw: string, followeeIdRaw: string): Promise<FollowUserResult> {
    if (followerIdRaw === followeeIdRaw) {
      throw new BusinessRuleException('Cannot follow yourself');
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
      throw new NotFoundDomainException('User to follow', followeeIdRaw);
    }

    const alreadyFollowing = await this.followRepository.exists(followerId, followeeId);
    if (alreadyFollowing) {
      throw new BusinessRuleException('Already following this user');
    }

    await this.followRepository.create(followerId, followeeId);
    await Promise.all([
      this.userRepository.incrementFollowingCount(followerId, 1),
      this.userRepository.incrementFollowersCount(followeeId, 1),
    ]);

    return {
      message: 'User followed successfully',
      following: true,
    };
  }
}
