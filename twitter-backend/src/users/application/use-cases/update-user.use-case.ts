import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USERS_TOKENS } from '../tokens';

interface UpdateUserPayload {
  id: string;
  username?: string;
  email?: string;
  bio?: string;
  profileImage?: string;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(payload: UpdateUserPayload): Promise<User> {
    const userId = UserId.fromString(payload.id);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundDomainException('User', payload.id);
    }

    user.updateProfile({
      username: payload.username,
      email: payload.email,
      bio: payload.bio,
      profileImage: payload.profileImage,
    });

    return this.userRepository.update(user);
  }
}
