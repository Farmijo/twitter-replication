import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const userId = UserId.fromString(id);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundDomainException('User', id);
    }

    return user;
  }
}
