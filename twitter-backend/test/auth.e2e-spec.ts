import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { TestAppFactory } from './test-app.factory';
import { teardownTestDatabase } from './setup';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    const collections = connection.db.collections();
    for (const collection of await collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
    await teardownTestDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        access_token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          username: 'testuser',
          email: 'test@example.com',
          role: 'admin', // First user is admin
          followersCount: 0,
          followingCount: 0,
        }),
      });

      // Verificar que no devuelva la contraseña
      expect(response.body.user.password).toBeUndefined();
    });

    it('should register second user as regular user (not admin)', async () => {
      // Crear primer usuario (admin)
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'admin',
          email: 'admin@example.com',
          password: 'password123',
        })
        .expect(201);

      // Crear segundo usuario
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'regularuser',
          email: 'user@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.user.role).toBe('user');
    });

    it('should reject registration with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
      };

      // Primer registro exitoso
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro con mismo username debería fallar
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test2@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.message).toContain('Username or email already exists');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
      };

      // Primer registro exitoso
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro con mismo email debería fallar
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.message).toContain('Username or email already exists');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message[0]).toContain('email');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
        })
        .expect(400);

      expect(response.body.message[0]).toContain('password');
    });

    it('should reject registration with short username', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message[0]).toContain('username');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba antes de cada test de login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);
    });

    it('should login with username successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        access_token: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          username: 'testuser',
          email: 'test@example.com',
        }),
      });

      // Verificar que no devuelva la contraseña
      expect(response.body.user.password).toBeUndefined();
    });

    it('should login with email successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'test@example.com', // Se puede usar email en el campo username
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        access_token: expect.any(String),
        user: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        }),
      });
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return valid JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(200);

      const token = response.body.access_token;
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
    });
  });

  describe('GET /auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      // Registrar y hacer login
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      authToken = registerResponse.body.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Profile retrieved successfully',
        user: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        }),
      });
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /auth/verify', () => {
    let authToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      authToken = registerResponse.body.access_token;
    });

    it('should verify valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Token is valid',
        user: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        }),
      });
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Integration: Register and Login Flow', () => {
    it('should complete full registration and login flow', async () => {
      // 1. Registrar usuario
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'flowtest',
          email: 'flow@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(registerResponse.body.access_token).toBeDefined();
      const userId = registerResponse.body.user.id;

      // 2. Hacer login con el mismo usuario
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'flowtest',
          password: 'password123',
        })
        .expect(200);

      expect(loginResponse.body.access_token).toBeDefined();
      expect(loginResponse.body.user.id).toBe(userId);

      // 3. Verificar el perfil con el token de login
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
        .expect(200);

      expect(profileResponse.body.user.username).toBe('flowtest');
    });

    it('should handle multiple users correctly', async () => {
      // Registrar usuario 1
      const user1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
        })
        .expect(201);

      // Registrar usuario 2
      const user2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        })
        .expect(201);

      // Verificar que son usuarios diferentes
      expect(user1Response.body.user.id).not.toBe(user2Response.body.user.id);
      expect(user1Response.body.user.role).toBe('admin'); // Primer usuario
      expect(user2Response.body.user.role).toBe('user'); // Segundo usuario

      // Login con usuario 1
      const login1Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'user1',
          password: 'password123',
        })
        .expect(200);

      // Login con usuario 2
      const login2Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'user2',
          password: 'password123',
        })
        .expect(200);

      // Verificar perfiles con tokens respectivos
      const profile1 = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${login1Response.body.access_token}`)
        .expect(200);

      const profile2 = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${login2Response.body.access_token}`)
        .expect(200);

      expect(profile1.body.user.username).toBe('user1');
      expect(profile2.body.user.username).toBe('user2');
    });
  });
});
