import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { CreateUserDto, LoginDto, ChangePasswordDto } from '../users/dto/user.dto';

export interface JwtPayload {
  username: string;
  sub: string;
  role: UserRole;
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
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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

      const payload: JwtPayload = {
        username: savedUser.username,
        sub: savedUser._id.toString(),
        role: savedUser.role,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: savedUser._id.toString(),
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
          bio: savedUser.bio,
          profileImage: savedUser.profileImage,
          followersCount: savedUser.followersCount,
          followingCount: savedUser.followingCount,
        },
      };
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

    const payload: JwtPayload = {
      username: user.username,
      sub: user._id.toString(),
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findById(payload.sub).select('-password').exec();
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
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

    return { message: 'Password changed successfully' };
  }

  async promoteToAdmin(userId: string): Promise<User> {
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

    return { message: 'User deactivated successfully' };
  }
}