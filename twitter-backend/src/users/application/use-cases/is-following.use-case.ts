import { Inject, Injectable } from '@nestjs/common';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class IsFollowingUseCase {
  constructor(
    @Inject(USERS_TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(followerIdRaw: string, followeeIdRaw: string): Promise<boolean> {
    const followerId = UserId.fromString(followerIdRaw);
    const followeeId = UserId.fromString(followeeIdRaw);
    return this.followRepository.exists(followerId, followeeId);
  }
}
