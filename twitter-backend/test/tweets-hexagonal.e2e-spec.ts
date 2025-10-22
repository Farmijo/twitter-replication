import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { TestAppFactory } from './test-app.factory';
import { TestDataHelper } from './test-data.helper';

describe('Tweets Hexagonal Architecture E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let testHelper: TestDataHelper;
  let userToken: string;
  let secondUserToken: string;
  let testUser: any;
  let secondTestUser: any;
  let testTweets: any[];

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
    testHelper = new TestDataHelper(app, connection);
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    await testHelper.clearDatabase();

    // Crear usuarios de prueba
    testUser = await testHelper.createTestUser();
    secondTestUser = await testHelper.createSecondTestUser();

    // Obtener tokens
    userToken = await testHelper.loginUser();
    secondUserToken = await testHelper.loginUser({
      email: 'test2@example.com',
      password: 'testpassword123',
    });

    // Crear tweets base para tests
    testTweets = await testHelper.createMultipleTestTweets(userToken, 3);
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await connection.close();
    await app.close();
  });

  describe('GET /tweets/v2/:id (Hexagonal Architecture)', () => {
    it('should get tweet by id successfully', async () => {
      const tweetId = testTweets[0]._id || testTweets[0].id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet retrieved successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          content: expect.stringContaining('Test tweet number 1'),
          authorId: expect.any(String),
          type: 'original',
          likesCount: 0,
          retweetsCount: 0,
          repliesCount: 0,
          hashtags: expect.arrayContaining(['testing', 'tweet1']),
          mentions: expect.any(Array),
          createdAt: expect.any(String),
          originalTweetId: null,
          parentTweetId: null,
        }),
      });
    });

    it('should return 404 for non-existent tweet', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain('Tweet with id');
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid tweet id format', async () => {
      const invalidId = 'invalid-id';

      await request(app.getHttpServer())
        .get(`/tweets/v2/${invalidId}`)
        .expect(400);
    });
  });

  describe('GET /tweets/v2/author/:authorId (Hexagonal Architecture)', () => {
    it('should get tweets by author successfully', async () => {
      const authorId = testUser._id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/author/${authorId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Author tweets retrieved successfully',
        data: expect.any(Array),
        count: 3,
      });

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          authorId: authorId.toString(),
          type: 'original',
          likesCount: 0,
          retweetsCount: 0,
          repliesCount: 0,
          hashtags: expect.any(Array),
          mentions: expect.any(Array),
          createdAt: expect.any(String),
        })
      );
    });

    it('should return empty array for user with no tweets', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/author/${secondTestUser._id}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Author tweets retrieved successfully',
        data: [],
        count: 0,
      });
    });

    it('should return 400 for invalid author id format', async () => {
      const invalidId = 'invalid-author-id';

      await request(app.getHttpServer())
        .get(`/tweets/v2/author/${invalidId}`)
        .expect(400);
    });
  });

  describe('GET /tweets/v2/:id/replies (Hexagonal Architecture)', () => {
    it('should get replies to a tweet successfully', async () => {
      const parentTweetId = testTweets[0]._id || testTweets[0].id;

      // Crear algunas replies
      await testHelper.createTestReply(secondUserToken, parentTweetId, 'First reply');
      await testHelper.createTestReply(userToken, parentTweetId, 'Second reply');

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${parentTweetId}/replies`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet replies retrieved successfully',
        data: expect.any(Array),
        count: 2,
      });

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: 'First reply',
          authorId: expect.any(String),
          type: 'reply',
          parentTweetId: parentTweetId.toString(),
          createdAt: expect.any(String),
        })
      );
    });

    it('should return empty array for tweet with no replies', async () => {
      const tweetId = testTweets[1]._id || testTweets[1].id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}/replies`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet replies retrieved successfully',
        data: [],
        count: 0,
      });
    });

    it('should return 400 for invalid tweet id format', async () => {
      const invalidId = 'invalid-tweet-id';

      await request(app.getHttpServer())
        .get(`/tweets/v2/${invalidId}/replies`)
        .expect(400);
    });
  });

  describe('Tweets Hexagonal Architecture - Integration Tests', () => {
    it('should maintain consistency between old and new endpoints', async () => {
      const tweetId = testTweets[0]._id || testTweets[0].id;

      // Obtener tweet con endpoint viejo
      const oldResponse = await request(app.getHttpServer())
        .get(`/tweets/${tweetId}`)
        .expect(200);

      // Obtener tweet con endpoint nuevo
      const newResponse = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      // Comparar campos esenciales
      expect(newResponse.body.data.id).toBe(oldResponse.body.data.id || oldResponse.body.data._id);
      expect(newResponse.body.data.content).toBe(oldResponse.body.data.content);
      expect(newResponse.body.data.authorId).toBe(oldResponse.body.data.userId?.toString() || oldResponse.body.data.author?._id?.toString());
    });

    it('should handle hashtags and mentions correctly', async () => {
      // Crear tweet con hashtags y mentions
      const tweetWithTags = await testHelper.createTestTweet(userToken, {
        content: 'Hello @testuser2 this is a tweet with #hashtag #testing and @mention',
      });

      const tweetId = tweetWithTags._id || tweetWithTags.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.hashtags).toEqual(
        expect.arrayContaining(['hashtag', 'testing'])
      );
      expect(response.body.data.mentions).toEqual(
        expect.arrayContaining(['testuser2', 'mention'])
      );
    });

    it('should handle tweets with special characters and emojis', async () => {
      const specialContent = 'Special tweet with émojis 🚀 and ñüéñts #special';
      const specialTweet = await testHelper.createTestTweet(userToken, {
        content: specialContent,
      });

      const tweetId = specialTweet._id || specialTweet.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.content).toBe(specialContent);
      expect(response.body.data.hashtags).toContain('special');
    });
  });

  describe('Performance and Load Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const tweetId = testTweets[0]._id || testTweets[0].id;
      
      // Crear 10 requests concurrentes
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer()).get(`/tweets/v2/${tweetId}`)
      );

      const responses = await Promise.all(promises);

      // Todas las respuestas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(tweetId.toString());
      });
    });

    it('should handle large number of tweets by author efficiently', async () => {
      // Crear muchos tweets para el usuario
      const manyTweets = await testHelper.createMultipleTestTweets(userToken, 20);
      
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/author/${testUser._id}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.count).toBe(23); // 3 iniciales + 20 nuevos
      expect(responseTime).toBeLessThan(2000); // Menos de 2 segundos
    });
  });
});