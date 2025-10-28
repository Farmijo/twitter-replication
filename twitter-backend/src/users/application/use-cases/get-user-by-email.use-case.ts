import { Inject, Injectable } from '@nestjs/common';
import { NotFoundDomainException } from '../../../shared/domain/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string): Promise<User> {
    const emailVo = new Email(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user) {
      throw new NotFoundDomainException('User', email);
    }

    return user;
  }
}
