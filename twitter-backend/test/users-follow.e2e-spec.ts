import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestAppFactory } from './test-app.factory';
import { teardownTestDatabase } from './setup';

interface RegisteredUser {
  token: string;
  user: { id: string; username: string };
}

describe('Users Follow E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let primaryUser: RegisteredUser;
  let secondaryUser: RegisteredUser;

  const registerUser = async (
    overrides: Partial<{ username: string; email: string; password: string }> = {},
  ): Promise<RegisteredUser> => {
    const baseUser = {
      username: `user_${Date.now()}_${Math.random()}`,
      email: `user_${Date.now()}_${Math.random()}@example.com`,
      password: 'password123',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(baseUser)
      .expect(201);

    return {
      token: response.body.access_token as string,
      user: response.body.user as { id: string; username: string },
    };
  };

  const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    const collections = await connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }

    primaryUser = await registerUser({ username: 'primaryUser', email: 'primary@example.com' });
    secondaryUser = await registerUser({ username: 'secondaryUser', email: 'secondary@example.com' });
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
    await teardownTestDatabase();
  });

  it('allows a user to follow another user', async () => {
    const response = await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    expect(response.body).toEqual({
      message: 'User followed successfully',
      following: true,
    });
  });

  it('prevents duplicate follow relationships', async () => {
    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(400);
  });

  it('allows a user to unfollow another user', async () => {
    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    const response = await request(app.getHttpServer())
      .delete(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(200);

    expect(response.body).toEqual({
      message: 'User unfollowed successfully',
      following: false,
    });
  });

  it('retrieves following list with pagination', async () => {
    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/users/${primaryUser.user.id}/following`)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Following list retrieved successfully',
      data: expect.arrayContaining([
        expect.objectContaining({ id: secondaryUser.user.id, username: secondaryUser.user.username }),
      ]),
      pagination: expect.objectContaining({
        total: 1,
        limit: 20,
        skip: 0,
      }),
    });
  });

  it('retrieves followers list with pagination', async () => {
    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/users/${secondaryUser.user.id}/followers`)
      .expect(200);

    expect(response.body).toEqual({
      message: 'Followers list retrieved successfully',
      data: expect.arrayContaining([
        expect.objectContaining({ id: primaryUser.user.id, username: primaryUser.user.username }),
      ]),
      pagination: expect.objectContaining({
        total: 1,
        limit: 20,
        skip: 0,
      }),
    });
  });

  it('checks following status', async () => {
    const beforeFollow = await request(app.getHttpServer())
      .get(`/users/${secondaryUser.user.id}/is-following`)
      .set(authHeader(primaryUser.token))
      .expect(200);

    expect(beforeFollow.body).toEqual({
      isFollowing: false,
      message: 'You are not following this user',
    });

    await request(app.getHttpServer())
      .post(`/users/${secondaryUser.user.id}/follow`)
      .set(authHeader(primaryUser.token))
      .expect(201);

    const afterFollow = await request(app.getHttpServer())
      .get(`/users/${secondaryUser.user.id}/is-following`)
      .set(authHeader(primaryUser.token))
      .expect(200);

    expect(afterFollow.body).toEqual({
      isFollowing: true,
      message: 'You are following this user',
    });
  });
});
