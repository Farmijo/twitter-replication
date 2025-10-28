import { FollowSummary } from '../models/follow-summary.model';
import { UserId } from '../value-objects/user-id.vo';

export interface FollowRepository {
  create(followerId: UserId, followeeId: UserId): Promise<void>;
  delete(followerId: UserId, followeeId: UserId): Promise<boolean>;
  exists(followerId: UserId, followeeId: UserId): Promise<boolean>;
  findFollowing(userId: UserId, options: { limit: number; skip: number }): Promise<{
    users: FollowSummary[];
    total: number;
    limit: number;
    skip: number;
  }>;
  findFollowers(userId: UserId, options: { limit: number; skip: number }): Promise<{
    users: FollowSummary[];
    total: number;
    limit: number;
    skip: number;
  }>;
  countFollowers(userId: UserId): Promise<number>;
  countFollowing(userId: UserId): Promise<number>;
}
