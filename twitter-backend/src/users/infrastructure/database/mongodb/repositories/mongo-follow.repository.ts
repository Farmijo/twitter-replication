import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { FollowRepository } from '../../../../domain/repositories/follow.repository';
import { FollowSummary } from '../../../../domain/models/follow-summary.model';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { FollowModel, FollowDocument } from '../models/follow.model';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class MongoFollowRepository implements FollowRepository {
  private readonly followProjectionFields = 'username email profileImage followersCount followingCount bio createdAt updatedAt';

  constructor(
    @InjectModel(FollowModel.name)
    private readonly followModel: Model<FollowDocument>,
  ) {}

  async create(followerId: UserId, followeeId: UserId): Promise<void> {
    await this.followModel.create({
      followerId: new Types.ObjectId(followerId.getValue()),
      followeeId: new Types.ObjectId(followeeId.getValue()),
    });
  }

  async delete(followerId: UserId, followeeId: UserId): Promise<boolean> {
    const deleted = await this.followModel
      .findOneAndDelete({
        followerId: new Types.ObjectId(followerId.getValue()),
        followeeId: new Types.ObjectId(followeeId.getValue()),
      })
      .exec();

    return Boolean(deleted);
  }

  async exists(followerId: UserId, followeeId: UserId): Promise<boolean> {
    const exists = await this.followModel.exists({
      followerId: new Types.ObjectId(followerId.getValue()),
      followeeId: new Types.ObjectId(followeeId.getValue()),
    });

    return Boolean(exists);
  }

  async findFollowing(userId: UserId, options: { limit: number; skip: number }): Promise<{ users: FollowSummary[]; total: number; limit: number; skip: number; }> {
    const followerObjectId = new Types.ObjectId(userId.getValue());

    const [total, follows] = await Promise.all([
      this.followModel.countDocuments({ followerId: followerObjectId }),
      this.followModel
        .find({ followerId: followerObjectId })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .populate({
          path: 'followeeId',
          select: this.followProjectionFields,
        })
        .lean(),
    ]);

    const users = follows
      .map(follow => UserMapper.toFollowSummary((follow as { followeeId?: unknown }).followeeId))
      .filter((summary): summary is FollowSummary => Boolean(summary.id));

    return {
      users,
      total,
      limit: options.limit,
      skip: options.skip,
    };
  }

  async findFollowers(userId: UserId, options: { limit: number; skip: number }): Promise<{ users: FollowSummary[]; total: number; limit: number; skip: number; }> {
    const followeeObjectId = new Types.ObjectId(userId.getValue());

    const [total, follows] = await Promise.all([
      this.followModel.countDocuments({ followeeId: followeeObjectId }),
      this.followModel
        .find({ followeeId: followeeObjectId })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .populate({
          path: 'followerId',
          select: this.followProjectionFields,
        })
        .lean(),
    ]);

    const users = follows
      .map(follow => UserMapper.toFollowSummary((follow as { followerId?: unknown }).followerId))
      .filter((summary): summary is FollowSummary => Boolean(summary.id));

    return {
      users,
      total,
      limit: options.limit,
      skip: options.skip,
    };
  }

  async countFollowers(userId: UserId): Promise<number> {
    return this.followModel.countDocuments({ followeeId: new Types.ObjectId(userId.getValue()) });
  }

  async countFollowing(userId: UserId): Promise<number> {
    return this.followModel.countDocuments({ followerId: new Types.ObjectId(userId.getValue()) });
  }
}
