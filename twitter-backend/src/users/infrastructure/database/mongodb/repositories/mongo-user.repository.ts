import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { User } from '../../../../domain/entities/user.entity';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Username } from '../../../../domain/value-objects/username.vo';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UserModel, UserDocument } from '../models/user.model';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    const persistence = UserMapper.toPersistence(user);
    const created = await this.userModel.create(persistence);
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const primitives = user.toPrimitives();
    const updatePayload = {
      username: primitives.username,
      email: primitives.email,
      bio: primitives.bio,
      profileImage: primitives.profileImage,
      role: primitives.role,
      isActive: primitives.isActive,
      followersCount: primitives.followersCount,
      followingCount: primitives.followingCount,
      updatedAt: new Date(),
    };

    const updated = await this.userModel
      .findByIdAndUpdate(primitives.id, updatePayload, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`User with id ${primitives.id} not found`);
    }

    return UserMapper.toDomain(updated);
  }

  async deleteById(id: UserId): Promise<void> {
    await this.userModel.findByIdAndDelete(id.getValue()).exec();
  }

  async findById(id: UserId): Promise<User | null> {
    const user = await this.userModel.findById(id.getValue()).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByUsername(username: Username): Promise<User | null> {
    const user = await this.userModel.findOne({ username: username.getValue() }).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.userModel.findOne({ email: email.getValue() }).exec();
    return user ? UserMapper.toDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => UserMapper.toDomain(user));
  }

  async incrementFollowersCount(id: UserId, amount: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id.getValue(),
      {
        $inc: { followersCount: amount },
        updatedAt: new Date(),
      },
      { new: false },
    );
  }

  async incrementFollowingCount(id: UserId, amount: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id.getValue(),
      {
        $inc: { followingCount: amount },
        updatedAt: new Date(),
      },
      { new: false },
    );
  }
}
