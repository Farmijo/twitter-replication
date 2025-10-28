import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { Password } from '../../../../domain/value-objects/password.vo';
import { UserId } from '../../../../domain/value-objects/user-id.vo';
import { Username } from '../../../../domain/value-objects/username.vo';
import { FollowSummary } from '../../../../domain/models/follow-summary.model';
import { UserModel, UserDocument } from '../models/user.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserLike =
  | HydratedDocument<UserModel>
  | (Partial<UserModel> & { _id?: Types.ObjectId | string; id?: string })
  | Record<string, any>;

export class UserMapper {
  static toDomain(document: UserLike): User {
    const idValue = document.id ?? document._id;
    const createdAt = document.createdAt ? new Date(document.createdAt) : new Date();
    const updatedAt = document.updatedAt ? new Date(document.updatedAt) : createdAt;

    return new User(
      UserId.fromString(idValue?.toString() ?? new Types.ObjectId().toString()),
      new Username(document.username ?? ''),
      new Email(document.email ?? ''),
      new Password(document.password ?? ''),
      document.role,
      document.bio ?? '',
      document.profileImage ?? '',
      document.followersCount ?? 0,
      document.followingCount ?? 0,
      document.isActive ?? true,
      createdAt,
      updatedAt,
    );
  }

  static toPersistence(user: User): Partial<UserModel> {
    const primitives = user.toPrimitives();
    return {
      _id: new Types.ObjectId(primitives.id),
      username: primitives.username,
      email: primitives.email,
      password: primitives.password,
      role: primitives.role,
      bio: primitives.bio,
      profileImage: primitives.profileImage,
      followersCount: primitives.followersCount,
      followingCount: primitives.followingCount,
      isActive: primitives.isActive,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    } as Partial<UserModel>;
  }

  static toFollowSummary(document: UserLike | null | undefined): FollowSummary {
    if (!document) {
      return { id: '' };
    }

    const candidate = document as Record<string, unknown> & { _id?: Types.ObjectId | string; id?: string };
    const idValue = candidate.id ?? candidate._id;
    return {
      id: idValue?.toString() ?? '',
      username: candidate.username as string | undefined,
      email: candidate.email as string | undefined,
      profileImage: candidate.profileImage as string | undefined,
      followersCount: candidate.followersCount as number | undefined,
      followingCount: candidate.followingCount as number | undefined,
      bio: candidate.bio as string | undefined,
      createdAt: candidate.createdAt ? new Date(candidate.createdAt as string | number | Date) : undefined,
      updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt as string | number | Date) : undefined,
    };
  }
}
