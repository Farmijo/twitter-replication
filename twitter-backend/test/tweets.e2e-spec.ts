import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestAppFactory } from './test-app.factory';
import { teardownTestDatabase } from './setup';

describe('Tweets E2E Tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let userToken: string;
  let user: { id: string };
  let secondUserToken: string;
  let secondUser: { id: string };

  const registerUser = async (overrides: Partial<{ username: string; email: string; password: string }> = {}) => {
    const defaultUser = {
      username: `user${Date.now()}`,
      email: `user${Date.now()}@example.com`,
      password: 'password123',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(defaultUser)
      .expect(201);

    return {
      token: response.body.access_token as string,
      user: response.body.user as { id: string; username: string; email: string },
    };
  };

  const createTweet = async (
    token: string,
    tweetData: Partial<{ content: string; type: string; parentTweetId: string; originalTweetId: string }> = {},
  ) => {
    const defaultTweet = {
      content: 'This is a test tweet #testing',
      ...tweetData,
    };

    const response = await request(app.getHttpServer())
      .post('/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send(defaultTweet)
      .expect(201);

    return response.body.data as any;
  };

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    const collections = connection.db.collections();
    for (const collection of await collections) {
      await collection.deleteMany({});
    }

    ({ token: userToken, user } = await registerUser({ username: 'testuser', email: 'test@example.com' }));
    ({ token: secondUserToken, user: secondUser } = await registerUser({ username: 'seconduser', email: 'second@example.com' }));
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
    await teardownTestDatabase();
  });

  describe('POST /tweets', () => {
    it('should create a tweet successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/tweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Hello world #greeting' })
        .expect(201);

      expect(response.body).toEqual({
        message: 'Tweet created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          content: 'Hello world #greeting',
          authorId: user.id,
          type: 'original',
          likesCount: 0,
          retweetsCount: 0,
          repliesCount: 0,
          hashtags: expect.arrayContaining(['greeting']),
          mentions: expect.any(Array),
          createdAt: expect.any(String),
          originalTweetId: null,
          parentTweetId: null,
        }),
      });
    });

    it('should reject tweet creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/tweets')
        .send({ content: 'Unauthorized tweet' })
        .expect(401);
    });
  });

  describe('GET /tweets/:id', () => {
    it('should retrieve a tweet by id', async () => {
      const createdTweet = await createTweet(userToken, { content: 'Tweet to fetch #fetch' });

      const response = await request(app.getHttpServer())
        .get(`/tweets/${createdTweet.id}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet retrieved successfully',
        data: expect.objectContaining({
          id: createdTweet.id,
          content: 'Tweet to fetch #fetch',
          authorId: user.id,
        }),
      });
    });

    it('should return 404 for non-existent tweet', async () => {
      await request(app.getHttpServer())
        .get('/tweets/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('GET /tweets/author/:authorId', () => {
    it('should retrieve tweets for an author', async () => {
      await createTweet(userToken, { content: 'Author tweet 1 #author' });
      await createTweet(userToken, { content: 'Author tweet 2 #author' });

      const response = await request(app.getHttpServer())
        .get(`/tweets/author/${user.id}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Author tweets retrieved successfully',
        data: expect.any(Array),
        count: 2,
      });

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          authorId: user.id,
          id: expect.any(String),
          content: expect.any(String),
        }),
      );
    });

    it('should return empty array for author with no tweets', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tweets/author/${secondUser.id}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Author tweets retrieved successfully',
        data: [],
        count: 0,
      });
    });
  });

  describe('GET /tweets/:id/replies', () => {
    it('should return replies for a tweet', async () => {
      const parentTweet = await createTweet(userToken, { content: 'Parent tweet #parent' });

      await createTweet(secondUserToken, {
        content: 'First reply',
        type: 'reply',
        parentTweetId: parentTweet.id,
      });

      await createTweet(userToken, {
        content: 'Second reply',
        type: 'reply',
        parentTweetId: parentTweet.id,
      });

      const response = await request(app.getHttpServer())
        .get(`/tweets/${parentTweet.id}/replies`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet replies retrieved successfully',
        data: expect.any(Array),
        count: 2,
      });

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          parentTweetId: parentTweet.id,
          content: expect.any(String),
          type: 'reply',
        }),
      );
    });
  });

  describe('PUT /tweets/:id', () => {
    it('should update a tweet content', async () => {
      const tweet = await createTweet(userToken, { content: 'Tweet to update' });

      const response = await request(app.getHttpServer())
        .put(`/tweets/${tweet.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'Updated tweet content #updated' })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Tweet updated successfully',
        data: expect.objectContaining({
          id: tweet.id,
          content: 'Updated tweet content #updated',
          hashtags: expect.arrayContaining(['updated']),
        }),
      });
    });
  });

  describe('DELETE /tweets/:id', () => {
    it('should delete a tweet successfully', async () => {
      const tweet = await createTweet(userToken, { content: 'Tweet to delete' });

      await request(app.getHttpServer())
        .delete(`/tweets/${tweet.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/tweets/${tweet.id}`)
        .expect(404);
    });
  });
});
