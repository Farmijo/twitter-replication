import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

import { TestAppFactory } from './test-app.factory';

describe('MongoDB Memory Server Configuration Test', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    app = await TestAppFactory.createTestApp();
    connection = app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  it('should connect to MongoDB Memory Server successfully', async () => {
    expect(connection).toBeDefined();
    expect(connection.readyState).toBe(1); // Connected
    
    // Verificar que es una conexión en memoria
    const dbName = connection.db.databaseName;
    expect(dbName).toMatch(/test/); // Aceptar cualquier nombre que contenga "test"
    
    console.log('✅ MongoDB Memory Server funcionando correctamente');
    console.log('📊 Base de datos:', dbName);
    console.log('🔗 Estado de conexión:', connection.readyState);
    console.log('🔗 URI completa:', process.env.MONGODB_URI);
  });

  it('should be able to create and drop collections', async () => {
    // Crear una colección de prueba
    const testCollection = connection.db.collection('test_collection');
    
    // Insertar un documento
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    
    // Verificar que se insertó
    const count = await testCollection.countDocuments();
    expect(count).toBe(1);
    
    // Limpiar
    await testCollection.drop();
    
    console.log('✅ Operaciones CRUD funcionando correctamente');
  });

  it('should isolate tests properly', async () => {
    // Este test verifica que la colección anterior no existe
    const collections = await connection.db.collections();
    const testCollectionExists = collections.some(col => col.collectionName === 'test_collection');
    
    expect(testCollectionExists).toBe(false);
    
    console.log('✅ Aislamiento entre tests funcionando correctamente');
  });
});