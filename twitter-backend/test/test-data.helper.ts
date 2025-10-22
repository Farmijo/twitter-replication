import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';

export class TestDataHelper {
  constructor(
    private readonly app: INestApplication,
    private readonly connection: Connection,
  ) {}

  // Limpiar base de datos
  async clearDatabase() {
    const collections = this.connection.db.collections();
    
    for (const collection of await collections) {
      await collection.deleteMany({});
    }
  }

  // Crear usuario de prueba
  async createTestUser(userData: any = {}) {
    const defaultUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123',
      displayName: 'Test User',
      ...userData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/auth/register')
      .send(defaultUser)
      .expect(201);

    return response.body.data;
  }

  // Login y obtener token
  async loginUser(credentials: any = {}) {
    const defaultCredentials = {
      email: 'test@example.com',
      password: 'testpassword123',
      ...credentials,
    };

    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(defaultCredentials)
      .expect(200);

    return response.body.data.access_token;
  }

  // Crear tweet de prueba
  async createTestTweet(token: string, tweetData: any = {}) {
    const defaultTweet = {
      content: 'This is a test tweet #testing',
      ...tweetData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send(defaultTweet)
      .expect(201);

    return response.body.data;
  }

  // Crear múltiples tweets de prueba
  async createMultipleTestTweets(token: string, count: number = 3) {
    const tweets = [];
    
    for (let i = 0; i < count; i++) {
      const tweet = await this.createTestTweet(token, {
        content: `Test tweet number ${i + 1} #testing #tweet${i + 1}`,
      });
      tweets.push(tweet);
    }
    
    return tweets;
  }

  // Crear usuario adicional para tests de replies
  async createSecondTestUser() {
    return await this.createTestUser({
      username: 'testuser2',
      email: 'test2@example.com',
      displayName: 'Test User 2',
    });
  }

  // Crear reply de prueba
  async createTestReply(token: string, parentTweetId: string, content: string = 'This is a test reply') {
    const response = await request(this.app.getHttpServer())
      .post('/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content,
        replyTo: parentTweetId,
      })
      .expect(201);

    return response.body.data;
  }
}