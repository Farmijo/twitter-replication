import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, { ...updateUserDto, updatedAt: new Date() }, { new: true })
        .select('-password')
        .exec();
      
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async incrementFollowersCount(id: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $inc: { followersCount: 1 }, updatedAt: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();
  }

  async incrementFollowingCount(id: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        { $inc: { followingCount: 1 }, updatedAt: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();
  }

  // MVP Following System Methods
  async followUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Verificar que ambos usuarios existan
    const [follower, followee] = await Promise.all([
      this.userModel.findById(followerId),
      this.userModel.findById(followeeId)
    ]);

    if (!follower) {
      throw new NotFoundException('Follower user not found');
    }
    if (!followee) {
      throw new NotFoundException('User to follow not found');
    }

    // Verificar si ya sigue al usuario
    if (follower.following.includes(new Types.ObjectId(followeeId))) {
      throw new BadRequestException('Already following this user');
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      // Add to follower's following list
      await this.userModel.findByIdAndUpdate(
        followerId,
        { 
          $addToSet: { following: followeeId },
          $inc: { followingCount: 1 },
          updatedAt: new Date()
        },
        { session }
      );

      // Add to followee's followers list  
      await this.userModel.findByIdAndUpdate(
        followeeId,
        { 
          $addToSet: { followers: followerId },
          $inc: { followersCount: 1 },
          updatedAt: new Date()
        },
        { session }
      );

      await session.commitTransaction();
      return { 
        message: 'User followed successfully',
        following: true 
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async unfollowUser(followerId: string, followeeId: string) {
    if (followerId === followeeId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    // Verificar que el usuario esté siguiendo al otro
    const follower = await this.userModel.findById(followerId);
    if (!follower || !follower.following.includes(new Types.ObjectId(followeeId))) {
      throw new BadRequestException('Not following this user');
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();

    try {
      await this.userModel.findByIdAndUpdate(
        followerId,
        { 
          $pull: { following: followeeId },
          $inc: { followingCount: -1 },
          updatedAt: new Date()
        },
        { session }
      );

      await this.userModel.findByIdAndUpdate(
        followeeId,
        { 
          $pull: { followers: followerId },
          $inc: { followersCount: -1 },
          updatedAt: new Date()
        },
        { session }
      );

      await session.commitTransaction();
      return { 
        message: 'User unfollowed successfully',
        following: false 
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getFollowing(userId: string, limit = 20, skip = 0) {
    const user = await this.userModel.findById(userId)
      .populate({
        path: 'following',
        select: 'username email profileImage followersCount bio',
        options: { limit, skip }
      });
      
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      following: user.following || [],
      total: user.followingCount,
      limit,
      skip
    };
  }

  async getFollowers(userId: string, limit = 20, skip = 0) {
    const user = await this.userModel.findById(userId)
      .populate({
        path: 'followers', 
        select: 'username email profileImage followersCount bio',
        options: { limit, skip }
      });
      
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      followers: user.followers || [],
      total: user.followersCount,
      limit,
      skip
    };
  }

  async isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const user = await this.userModel.findById(followerId).select('following');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.following.includes(new Types.ObjectId(followeeId));
  }

  async getFollowingStats(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');  
    }
    
    return {
      followersCount: user.followersCount,
      followingCount: user.followingCount
    };
  }
}