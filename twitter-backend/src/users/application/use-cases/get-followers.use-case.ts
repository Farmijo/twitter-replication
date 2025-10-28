import { Inject, Injectable } from '@nestjs/common';
import { FollowRepository } from '../../domain/repositories/follow.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

interface PaginationOptions {
  limit?: number;
  skip?: number;
}

@Injectable()
export class GetFollowersUseCase {
  constructor(
    @Inject(USERS_TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(userIdRaw: string, options: PaginationOptions = {}) {
    const userId = UserId.fromString(userIdRaw);
    const limit = options.limit ?? 20;
    const skip = options.skip ?? 0;

    return this.followRepository.findFollowers(userId, { limit, skip });
  }
}
