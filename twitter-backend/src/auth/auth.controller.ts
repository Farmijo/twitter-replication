import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CreateUserDto, LoginDto, ChangePasswordDto } from '../users/dto/user.dto';

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    return {
      message: 'User registered successfully',
      ...result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'Login successful',
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const tokenId = req.user?.tokenId;
    const userId = req.user?.id ?? req.user?._id?.toString?.();
    await this.authService.logout(tokenId, userId);
    return {
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      message: 'Profile retrieved successfully',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const result = await this.authService.changePassword(req.user.id, changePasswordDto);
    return result;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('promote/:userId')
  async promoteToAdmin(@Param('userId') userId: string) {
    const user = await this.authService.promoteToAdmin(userId);
    return {
      message: 'User promoted to admin successfully',
      user,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('deactivate/:userId')
  async deactivateUser(@Param('userId') userId: string) {
    const result = await this.authService.deactivateUser(userId);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@Request() req) {
    return {
      message: 'Token is valid',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }
}