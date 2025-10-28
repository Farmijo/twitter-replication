import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminGuard } from '../../../../auth/admin.guard';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { ValidationException, BusinessRuleException, NotFoundDomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { UserResponseMapper } from '../../../application/dto/user-response.dto';
import { FollowResponseMapper } from '../../../application/dto/follow-response.dto';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';
import { GetUserByUsernameUseCase } from '../../../application/use-cases/get-user-by-username.use-case';
import { GetUserByEmailUseCase } from '../../../application/use-cases/get-user-by-email.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { FollowUserUseCase } from '../../../application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '../../../application/use-cases/unfollow-user.use-case';
import { GetFollowingUseCase } from '../../../application/use-cases/get-following.use-case';
import { GetFollowersUseCase } from '../../../application/use-cases/get-followers.use-case';
import { IsFollowingUseCase } from '../../../application/use-cases/is-following.use-case';
import { GetUserStatsUseCase } from '../../../application/use-cases/get-user-stats.use-case';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserByUsernameUseCase: GetUserByUsernameUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    private readonly getFollowingUseCase: GetFollowingUseCase,
    private readonly getFollowersUseCase: GetFollowersUseCase,
    private readonly isFollowingUseCase: IsFollowingUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    const users = await this.getUsersUseCase.execute();
    const data = UserResponseMapper.toDtoList(users);
    return {
      message: 'Users retrieved successfully (Admin access)',
      data,
      count: data.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.getUserByIdUseCase.execute(id);
      return {
        message: 'User retrieved successfully',
        data: UserResponseMapper.toDto(user),
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    try {
      const user = await this.getUserByUsernameUseCase.execute(username);
      return {
        message: 'User retrieved successfully',
        data: UserResponseMapper.toDto(user),
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    try {
      const user = await this.getUserByEmailUseCase.execute(email);
      return {
        message: 'User retrieved successfully (Admin access)',
        data: UserResponseMapper.toDto(user),
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteUserUseCase.execute(id);
      return {
        message: 'User deleted successfully (Admin access)',
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(@Param('id') followeeId: string, @Request() req) {
    const followerId = this.extractUserId(req.user);

    try {
      const result = await this.followUserUseCase.execute(followerId, followeeId);
      return {
        message: result.message,
        following: result.following,
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/follow')
  async unfollowUser(@Param('id') followeeId: string, @Request() req) {
    const followerId = this.extractUserId(req.user);

    try {
      const result = await this.unfollowUserUseCase.execute(followerId, followeeId);
      return {
        message: result.message,
        following: result.following,
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    try {
      const result = await this.getFollowingUseCase.execute(userId, {
        limit: limit ? parseInt(limit, 10) : undefined,
        skip: skip ? parseInt(skip, 10) : undefined,
      });

      return {
        message: 'Following list retrieved successfully',
        data: FollowResponseMapper.toSummaryList(result.users),
        pagination: {
          total: result.total,
          limit: result.limit,
          skip: result.skip,
        },
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    try {
      const result = await this.getFollowersUseCase.execute(userId, {
        limit: limit ? parseInt(limit, 10) : undefined,
        skip: skip ? parseInt(skip, 10) : undefined,
      });

      return {
        message: 'Followers list retrieved successfully',
        data: FollowResponseMapper.toSummaryList(result.users),
        pagination: {
          total: result.total,
          limit: result.limit,
          skip: result.skip,
        },
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-following')
  async isFollowing(@Param('id') followeeId: string, @Request() req) {
    const followerId = this.extractUserId(req.user);

    try {
      const isFollowing = await this.isFollowingUseCase.execute(followerId, followeeId);
      return {
        isFollowing,
        message: isFollowing ? 'You are following this user' : 'You are not following this user',
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  @Get(':id/stats')
  async getFollowingStats(@Param('id') userId: string) {
    try {
      const stats = await this.getUserStatsUseCase.execute(userId);
      return {
        message: 'User stats retrieved successfully',
        data: stats,
      };
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  private extractUserId(user: unknown): string {
    if (!user) {
      throw new BadRequestException('Invalid authenticated user');
    }

    if (typeof user === 'string') {
      return user;
    }

    if (typeof user === 'object' && user !== null) {
      const candidate = user as { id?: unknown; _id?: unknown };

      if (candidate.id) {
        return candidate.id.toString();
      }

      if (candidate._id) {
        return candidate._id.toString();
      }
    }

    throw new BadRequestException('Invalid authenticated user identifier');
  }

  private handleDomainError(error: unknown): never {
    if (error instanceof ValidationException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof BusinessRuleException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof NotFoundDomainException) {
      throw new NotFoundException(error.message);
    }

    throw error;
  }
}
