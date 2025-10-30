import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TweetsModule } from './tweets/tweets.module';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = Number(configService.get<number>('REDIS_PORT') ?? 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = Number(configService.get<number>('REDIS_DB') ?? 0);

        return {
          store: await redisStore({
            socket: {
              host,
              port,
            },
            password: password || undefined,
            database: Number.isInteger(db) ? db : 0,
          }),
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = Number(configService.get<number>('REDIS_PORT') ?? 6379);
        const password = configService.get<string>('REDIS_PASSWORD');
        const db = Number(configService.get<number>('REDIS_DB') ?? 0);

        return {
          connection: {
            host,
            port,
            password: password || undefined,
            db: Number.isInteger(db) ? db : 0,
          },
        };
      },
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/twitterdb?authSource=admin',
    ),
    AuthModule,
    UsersModule,
    TweetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}