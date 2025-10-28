import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USERS_TOKENS } from '../tokens';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USERS_TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
