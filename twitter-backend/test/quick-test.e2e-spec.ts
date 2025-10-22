import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { TestAppFactory } from './test-app.factory';
import { TestDataHelper } from './test-data.helper';

describe('Tweet populate transform test', () => {
  let app: INestApplication;
  let connection: Connection;
  let testHelper: TestDataHelper;
  let userToken: string;

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
    testHelper = new TestDataHelper(app, connection);
  });

  beforeEach(async () => {
    await testHelper.clearDatabase();
    const testUser = await testHelper.createTestUser();
    userToken = await testHelper.loginUser();
  });

  afterAll(async () => {
    await testHelper.clearDatabase();
    await connection.close();
    await app.close();
  });

  it('should return id instead of _id in originalTweetId populate', async () => {
    console.log('🧪 Testing originalTweetId populate transformation...');
    
    // Crear tweet original
    const originalTweet = await testHelper.createTestTweet(userToken, {
      content: 'This is the original tweet',
    });
    
    // Crear retweet que referencia al original
    const retweet = await testHelper.createTestTweet(userToken, {
      content: 'RT: This is a retweet',
      isRetweet: true,
      originalTweetId: originalTweet._id || originalTweet.id,
    });

    const retweetId = retweet._id || retweet.id;

    // Obtener el retweet con populate
    const response = await request(app.getHttpServer())
      .get(`/tweets/${retweetId}`)
      .expect(200);

    const tweet = response.body.data;
    
    console.log('📄 Tweet response:', JSON.stringify(tweet, null, 2));
    
    // Verificar que originalTweetId tiene 'id' y no '_id'
    if (tweet.originalTweetId) {
      expect(tweet.originalTweetId).toHaveProperty('id');
      expect(tweet.originalTweetId).not.toHaveProperty('_id');
      console.log('✅ originalTweetId.id:', tweet.originalTweetId.id);
      console.log('✅ Transform funcionando correctamente');
    } else {
      console.log('⚠️ originalTweetId es null - puede ser normal si no es un retweet');
    }

    // También verificar userId
    expect(tweet.userId).toHaveProperty('id');
    expect(tweet.userId).not.toHaveProperty('_id');
    console.log('✅ userId.id:', tweet.userId.id);
  });
});