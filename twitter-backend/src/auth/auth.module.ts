import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModel, UserSchema } from '../users/infrastructure/database/mongodb/models/user.model';
import { AuthTokenCacheService } from './services/auth-token-cache.service';
import { UserStateQueueService } from './services/user-state.queue.service';
import { USER_STATE_QUEUE } from './constants/user-state.queue';
import { UserStateProcessor } from './processors/user-state.processor';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-this-in-production',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    BullModule.registerQueue({
      name: USER_STATE_QUEUE,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthTokenCacheService, UserStateQueueService, UserStateProcessor],
  exports: [AuthService],
})
export class AuthModule {}