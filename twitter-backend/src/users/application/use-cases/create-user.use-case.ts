import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../../shared/domain/exceptions/domain.exception';
import { User, UserRole } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { Username } from '../../domain/value-objects/username.vo';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USERS_TOKENS } from '../tokens';

interface CreateUserPayload {
  id?: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  bio?: string;
  profileImage?: string;
  followersCount?: number;
  followingCount?: number;
  isActive?: boolean;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(payload: CreateUserPayload): Promise<User> {
    const username = new Username(payload.username);
    const email = new Email(payload.email);

    const existingByUsername = await this.userRepository.findByUsername(username);
    if (existingByUsername) {
      throw new BusinessRuleException('Username already exists');
    }

    const existingByEmail = await this.userRepository.findByEmail(email);
    if (existingByEmail) {
      throw new BusinessRuleException('Email already exists');
    }

    const user = User.create({
      id: payload.id ? UserId.fromString(payload.id) : undefined,
      username,
      email,
      password: new Password(payload.password),
      role: payload.role,
      bio: payload.bio,
      profileImage: payload.profileImage,
      followersCount: payload.followersCount,
      followingCount: payload.followingCount,
      isActive: payload.isActive,
    });

    const createdUser = await this.userRepository.create(user);
    return createdUser;
  }
}
