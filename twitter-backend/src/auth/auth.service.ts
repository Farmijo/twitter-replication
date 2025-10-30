import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserModel, UserDocument } from '../users/infrastructure/database/mongodb/models/user.model';
import { UserRole } from '../users/domain/entities/user.entity';
import { CreateUserDto, LoginDto, ChangePasswordDto } from '../users/dto/user.dto';
import { AuthTokenCacheService, CachedUserSnapshot } from './services/auth-token-cache.service';
import { UserStateQueueService } from './services/user-state.queue.service';

export interface JwtPayload {
  username: string;
  sub: string;
  role: UserRole;
  jti?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    bio: string;
    profileImage: string;
    followersCount: number;
    followingCount: number;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly authTokenCacheService: AuthTokenCacheService,
    private readonly userStateQueueService: UserStateQueueService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    try {
      // Por defecto, el primer usuario registrado será admin
      const userCount = await this.userModel.countDocuments();
      const role = userCount === 0 ? UserRole.ADMIN : (createUserDto.role || UserRole.USER);

      const userData = {
        ...createUserDto,
        role,
      };

      const createdUser = new this.userModel(userData);
      const savedUser = await createdUser.save();

      return await this.issueAuthResponse(savedUser);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({
      $or: [
        { username: loginDto.username },
        { email: loginDto.username },
      ],
    }).exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.issueAuthResponse(user);
  }

  async validateUser(payload: JwtPayload): Promise<UserDocument> {
    const user = await this.userModel.findById(payload.sub).select('-password').exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async logout(tokenId: string, userId: string): Promise<{ message: string }> {
    if (!tokenId || !userId) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.authTokenCacheService.invalidateToken(tokenId, userId);
    return { message: 'Logout successful' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(changePasswordDto.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = changePasswordDto.newPassword;
    await user.save();

    await this.userStateQueueService.enqueueInvalidateTokens(userId);

    return { message: 'Password changed successfully' };
  }

  async promoteToAdmin(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { role: UserRole.ADMIN, updatedAt: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userStateQueueService.enqueueSnapshotUpdate(this.mapUserResponse(user));

    return user;
  }

  async deactivateUser(userId: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userStateQueueService.enqueueInvalidateTokens(user.id);

    return { message: 'User deactivated successfully' };
  }

  private async issueAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const { token, jti, ttlSeconds } = this.generateToken(user);
    const userSnapshot = this.mapUserResponse(user);

    if (jti) {
      const ttl = ttlSeconds ?? undefined;
      if (ttl && ttl > 0) {
        await this.authTokenCacheService.storeToken(jti, userSnapshot, ttl);
      } else {
        this.logger.warn('Skipping auth token caching due to invalid TTL value');
      }
    }

    return {
      access_token: token,
      user: userSnapshot,
    };
  }

  private generateToken(user: UserDocument): {
    token: string;
    jti: string;
    ttlSeconds: number | null;
  } {
    const jti = new Types.ObjectId().toString();
    const payload: JwtPayload = {
      username: user.username,
      sub: user._id.toString(),
      role: user.role,
      jti,
    };

  const token = this.jwtService.sign(payload);
    const ttlSeconds = this.calculateTokenTtl(token);

    return { token, jti, ttlSeconds };
  }

  private mapUserResponse(user: UserDocument): CachedUserSnapshot {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio,
      profileImage: user.profileImage,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
    };
  }

  private calculateTokenTtl(token: string): number | null {
    try {
      const decoded = this.jwtService.decode(token);

      if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
        return null;
      }

      const exp = (decoded as { exp?: number }).exp;
      if (typeof exp !== 'number') {
        return null;
      }

      const secondsRemaining = exp - Math.floor(Date.now() / 1000);
      return secondsRemaining > 0 ? secondsRemaining : 0;
    } catch (error) {
      this.logger.warn(`Failed to calculate JWT TTL: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}