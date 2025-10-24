import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { TweetsModule } from '../src/tweets/tweets.module';
import { setupTestDatabase } from './setup';

export class TestAppFactory {
  static async createTestApp(): Promise<INestApplication> {
    // Setup MongoDB in memory and wait for it to be ready
    const mongoUri = await setupTestDatabase();
    
    console.log(`Creating test app with MongoDB at: ${mongoUri}`);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(mongoUri),
        AuthModule,
        UsersModule,
        TweetsModule,
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    // Apply global pipes (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    
    console.log('Test app initialized successfully');
    
    return app;
  }
}
