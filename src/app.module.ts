import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TweetsModule } from './tweets/tweets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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