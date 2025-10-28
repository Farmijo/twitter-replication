import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Username } from '../value-objects/username.vo';

export interface UserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  deleteById(id: UserId): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(): Promise<User[]>;
  incrementFollowersCount(id: UserId, amount: number): Promise<void>;
  incrementFollowingCount(id: UserId, amount: number): Promise<void>;
}
