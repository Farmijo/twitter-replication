import { BusinessRuleException } from '../../../shared/domain/exceptions/domain.exception';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Username } from '../value-objects/username.vo';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserPrimitives {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  bio: string;
  profileImage: string;
  followersCount: number;
  followingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private bio: string;
  private profileImage: string;
  private followersCount: number;
  private followingCount: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    private readonly id: UserId,
    private username: Username,
    private email: Email,
    private password: Password,
    private role: UserRole = UserRole.USER,
    bio = '',
    profileImage = '',
    followersCount = 0,
    followingCount = 0,
    isActive = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.bio = bio;
    this.profileImage = profileImage;
    this.followersCount = followersCount;
    this.followingCount = followingCount;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(params: {
    id?: UserId;
    username: Username;
    email: Email;
    password: Password;
    role?: UserRole;
    bio?: string;
    profileImage?: string;
    followersCount?: number;
    followingCount?: number;
    isActive?: boolean;
  }): User {
    const id = params.id ?? UserId.generate();
    return new User(
      id,
      params.username,
      params.email,
      params.password,
      params.role ?? UserRole.USER,
      params.bio ?? '',
      params.profileImage ?? '',
      params.followersCount ?? 0,
      params.followingCount ?? 0,
      params.isActive ?? true,
    );
  }

  public static fromPrimitives(data: UserPrimitives): User {
    return new User(
      UserId.fromString(data.id),
      new Username(data.username),
      new Email(data.email),
      new Password(data.password),
      data.role,
      data.bio,
      data.profileImage,
      data.followersCount,
      data.followingCount,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }

  public toPrimitives(): UserPrimitives {
    return {
      id: this.id.getValue(),
      username: this.username.getValue(),
      email: this.email.getValue(),
      password: this.password.getValue(),
      role: this.role,
      bio: this.bio,
      profileImage: this.profileImage,
      followersCount: this.followersCount,
      followingCount: this.followingCount,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public getId(): UserId {
    return this.id;
  }

  public getUsername(): string {
    return this.username.getValue();
  }

  public getEmail(): string {
    return this.email.getValue();
  }

  public getPassword(): string {
    return this.password.getValue();
  }

  public getRole(): UserRole {
    return this.role;
  }

  public getBio(): string {
    return this.bio;
  }

  public getProfileImage(): string {
    return this.profileImage;
  }

  public getFollowersCount(): number {
    return this.followersCount;
  }

  public getFollowingCount(): number {
    return this.followingCount;
  }

  public isUserActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public updateProfile(params: { username?: string; bio?: string; profileImage?: string; email?: string }): void {
    if (params.username) {
      this.username = new Username(params.username);
    }

    if (params.email) {
      this.email = new Email(params.email);
    }

    if (typeof params.bio === 'string') {
      this.bio = params.bio;
    }

    if (typeof params.profileImage === 'string') {
      this.profileImage = params.profileImage;
    }

    this.touch();
  }

  public changeRole(role: UserRole): void {
    this.role = role;
    this.touch();
  }

  public updatePassword(newPassword: string): void {
    this.password.update(newPassword);
    this.touch();
  }

  public deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  public activate(): void {
    this.isActive = true;
    this.touch();
  }

  public incrementFollowers(): void {
    this.followersCount++;
    this.touch();
  }

  public decrementFollowers(): void {
    if (this.followersCount === 0) {
      throw new BusinessRuleException('Followers count cannot be negative');
    }
    this.followersCount--;
    this.touch();
  }

  public incrementFollowing(): void {
    this.followingCount++;
    this.touch();
  }

  public decrementFollowing(): void {
    if (this.followingCount === 0) {
      throw new BusinessRuleException('Following count cannot be negative');
    }
    this.followingCount--;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
