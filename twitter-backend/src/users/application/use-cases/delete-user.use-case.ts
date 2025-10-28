import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const userId = UserId.fromString(id);
    const existing = await this.userRepository.findById(userId);

    if (!existing) {
      throw new NotFoundDomainException('User', id);
    }

    await this.userRepository.deleteById(userId);
  }
}
