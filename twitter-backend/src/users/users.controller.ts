import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Users retrieved successfully (Admin access)',
      data: users,
      count: users.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      message: 'User retrieved successfully (Admin access)',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully (Admin access)',
    };
  }

  // Following System Endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async followUser(@Param('id') followeeId: string, @Request() req) {
    const result = await this.usersService.followUser(req.user._id, followeeId);
    return {
      message: result.message,
      following: result.following,
    };
  }

  @UseGuards(JwtAuthGuard)  
  @Delete(':id/follow')
  async unfollowUser(@Param('id') followeeId: string, @Request() req) {
    const result = await this.usersService.unfollowUser(req.user._id, followeeId);
    return {
      message: result.message,
      following: result.following,
    };
  }

  @Get(':id/following')
  async getFollowing(
    @Param('id') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const result = await this.usersService.getFollowing(
      userId, 
      limit ? parseInt(limit) : 20,
      skip ? parseInt(skip) : 0
    );
    return {
      message: 'Following list retrieved successfully',
      data: result.following,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
      }
    };
  }

  @Get(':id/followers')
  async getFollowers(
    @Param('id') userId: string,
    @Query('limit') limit?: string, 
    @Query('skip') skip?: string,
  ) {
    const result = await this.usersService.getFollowers(
      userId,
      limit ? parseInt(limit) : 20, 
      skip ? parseInt(skip) : 0
    );
    return {
      message: 'Followers list retrieved successfully',
      data: result.followers,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/is-following')
  async isFollowing(@Param('id') followeeId: string, @Request() req) {
    const isFollowing = await this.usersService.isFollowing(req.user._id, followeeId);
    return { 
      isFollowing,
      message: isFollowing ? 'You are following this user' : 'You are not following this user'
    };
  }

  @Get(':id/stats')
  async getFollowingStats(@Param('id') userId: string) {
    const stats = await this.usersService.getFollowingStats(userId);
    return {
      message: 'User stats retrieved successfully',
      data: stats
    };
  }
}