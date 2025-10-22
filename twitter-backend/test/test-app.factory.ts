import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppModule } from '../src/app.module';

export class TestAppFactory {
  static async createTestApp(): Promise<INestApplication> {
    // Usar la URI de MongoDB en memoria establecida en setup.ts
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurado. Asegúrate de que setup.ts se ejecute primero.');
    }
    
    console.log('🔗 Conectando a MongoDB Memory Server:', mongoUri);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test', // Archivo de configuración específico para tests
        }),
        MongooseModule.forRoot(mongoUri),
        AppModule,
      ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    
    // Configurar pipes globales como en producción
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
    
    console.log('🚀 Test app inicializada con MongoDB en memoria');
    
    return app;
  }
}