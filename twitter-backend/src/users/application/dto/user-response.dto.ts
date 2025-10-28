import { User } from '../../domain/entities/user.entity';

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  profileImage: string;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseMapper {
  static toDto(user: User): UserResponseDto {
    const primitives = user.toPrimitives();
    return {
      id: primitives.id,
      username: primitives.username,
      email: primitives.email,
      role: primitives.role,
      bio: primitives.bio,
      profileImage: primitives.profileImage,
      followersCount: primitives.followersCount,
      followingCount: primitives.followingCount,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    };
  }

  static toDtoList(users: User[]): UserResponseDto[] {
    return users.map(UserResponseMapper.toDto);
  }
}
