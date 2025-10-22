import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { TestAppFactory } from './test-app.factory';
import { TestDataHelper } from './test-data.helper';

describe('Tweets Hexagonal Architecture - Edge Cases E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let testHelper: TestDataHelper;
  let userToken: string;
  let testUser: any;

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
    testHelper = new TestDataHelper(app, connection);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();
    testUser = await testHelper.createTestUser();
    userToken = await testHelper.loginUser();
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await connection.close();
    await app.close();
  });

  describe('Edge Cases - Invalid IDs', () => {
    it('should handle malformed MongoDB ObjectId', async () => {
      const malformedIds = [
        'invalid-id',
        '12345',
        'not-an-objectid',
        '',
        '507f1f77bcf86cd79943901', // Too short
        '507f1f77bcf86cd799439011z', // Invalid character
      ];

      for (const invalidId of malformedIds) {
        await request(app.getHttpServer())
          .get(`/tweets/v2/${invalidId}`)
          .expect(400);
      }
    });

    it('should handle null and undefined values in URLs', async () => {
      await request(app.getHttpServer())
        .get('/tweets/v2/null')
        .expect(400);

      await request(app.getHttpServer())
        .get('/tweets/v2/undefined')
        .expect(400);
    });
  });

  describe('Edge Cases - Empty Results', () => {
    it('should handle author with no tweets gracefully', async () => {
      // Usuario sin tweets
      const userWithoutTweets = await testHelper.createSecondTestUser();

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/author/${userWithoutTweets._id}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Author tweets retrieved successfully',
        data: [],
        count: 0,
      });
    });

    it('should handle tweet with no replies gracefully', async () => {
      const tweet = await testHelper.createTestTweet(userToken);
      const tweetId = tweet._id || tweet.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}/replies`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet replies retrieved successfully',
        data: [],
        count: 0,
      });
    });
  });

  describe('Edge Cases - Content Validation', () => {
    it('should handle tweets with maximum content length', async () => {
      // Contenido de 280 caracteres (límite de Twitter)
      const maxContent = 'a'.repeat(280) + ' #test';
      const tweet = await testHelper.createTestTweet(userToken, {
        content: maxContent,
      });

      const tweetId = tweet._id || tweet.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.content.length).toBeGreaterThan(280);
      expect(response.body.data.hashtags).toContain('test');
    });

    it('should handle tweets with many hashtags', async () => {
      const manyHashtags = Array.from({length: 10}, (_, i) => `#tag${i}`).join(' ');
      const content = `Tweet with many hashtags: ${manyHashtags}`;
      
      const tweet = await testHelper.createTestTweet(userToken, {
        content,
      });

      const tweetId = tweet._id || tweet.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.hashtags).toHaveLength(10);
      for (let i = 0; i < 10; i++) {
        expect(response.body.data.hashtags).toContain(`tag${i}`);
      }
    });

    it('should handle tweets with special unicode characters', async () => {
      const unicodeContent = 'Tweet with unicode: 🚀 🌟 ✨ 💫 ⭐ 中文 العربية русский 日本語 #unicode';
      
      const tweet = await testHelper.createTestTweet(userToken, {
        content: unicodeContent,
      });

      const tweetId = tweet._id || tweet.id;

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.content).toBe(unicodeContent);
      expect(response.body.data.hashtags).toContain('unicode');
    });
  });

  describe('Edge Cases - Nested Replies', () => {
    it('should handle deep reply chains', async () => {
      const originalTweet = await testHelper.createTestTweet(userToken, {
        content: 'Original tweet',
      });
      const originalTweetId = originalTweet._id || originalTweet.id;

      // Crear cadena de replies
      let parentId = originalTweetId;
      const replyChain = [];

      for (let i = 0; i < 5; i++) {
        const reply = await testHelper.createTestReply(
          userToken,
          parentId,
          `Reply level ${i + 1}`
        );
        replyChain.push(reply);
        parentId = reply._id || reply.id;
      }

      // Obtener replies del tweet original
      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${originalTweetId}/replies`)
        .expect(200);

      expect(response.body.data).toHaveLength(1); // Solo el primer nivel
      expect(response.body.data[0].content).toBe('Reply level 1');
    });
  });

  describe('Edge Cases - Concurrent Operations', () => {
    it('should handle race conditions when getting tweets', async () => {
      const tweet = await testHelper.createTestTweet(userToken);
      const tweetId = tweet._id || tweet.id;

      // Múltiples requests concurrentes al mismo tweet
      const concurrentRequests = Array(20).fill(null).map(() =>
        request(app.getHttpServer()).get(`/tweets/v2/${tweetId}`)
      );

      const responses = await Promise.all(concurrentRequests);

      // Todas las respuestas deben ser consistentes
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(tweetId.toString());
        expect(response.body.data.content).toBe(tweet.content);
      });
    });

    it('should handle concurrent requests to different endpoints', async () => {
      const tweets = await testHelper.createMultipleTestTweets(userToken, 3);
      const tweetId = tweets[0]._id || tweets[0].id;

      // Requests concurrentes a diferentes endpoints
      const promises = [
        request(app.getHttpServer()).get(`/tweets/v2/${tweetId}`),
        request(app.getHttpServer()).get(`/tweets/v2/author/${testUser._id}`),
        request(app.getHttpServer()).get(`/tweets/v2/${tweetId}/replies`),
      ];

      const [tweetResponse, authorResponse, repliesResponse] = await Promise.all(promises);

      expect(tweetResponse.status).toBe(200);
      expect(authorResponse.status).toBe(200);
      expect(repliesResponse.status).toBe(200);

      expect(authorResponse.body.data).toHaveLength(3);
      expect(repliesResponse.body.data).toHaveLength(0);
    });
  });

  describe('Edge Cases - Database States', () => {
    it('should handle tweets that exist in old format but not domain format', async () => {
      // Este test simula tweets creados con el sistema anterior
      const tweet = await testHelper.createTestTweet(userToken);
      const tweetId = tweet._id || tweet.id;

      // El tweet debe ser accesible através del nuevo endpoint
      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${tweetId}`)
        .expect(200);

      expect(response.body.data.id).toBe(tweetId.toString());
      expect(response.body.data.type).toBe('original'); // Default type
    });
  });

  describe('Edge Cases - Error Recovery', () => {
    it('should provide meaningful error messages', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain('Tweet with id');
      expect(response.body.message).toContain('not found');
      expect(response.body.message).toContain(nonExistentId);
    });

    it('should handle network timeouts gracefully', async () => {
      // Crear muchos tweets para hacer la query más lenta
      await testHelper.createMultipleTestTweets(userToken, 50);

      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get(`/tweets/v2/author/${testUser._id}`)
        .timeout(5000) // 5 segundos de timeout
        .expect(200);

      const endTime = Date.now();
      
      expect(response.body.count).toBe(50);
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});