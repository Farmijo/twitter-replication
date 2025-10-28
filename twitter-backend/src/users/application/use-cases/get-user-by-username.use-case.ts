import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Username } from '../../domain/value-objects/username.vo';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class GetUserByUsernameUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(username: string): Promise<User> {
    const usernameVo = new Username(username);
    const user = await this.userRepository.findByUsername(usernameVo);

    if (!user) {
      throw new NotFoundDomainException('User', username);
    }

    return user;
  }
}
