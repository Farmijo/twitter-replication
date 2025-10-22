import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';

let mongoServer: MongoMemoryServer;

// Setup global para tests e2e
beforeAll(async () => {
  // Configurar timeout global para tests
  jest.setTimeout(30000);
  
  // Iniciar servidor MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  
  // Obtener la URI base y agregar el nombre de la base de datos
  const baseUri = mongoServer.getUri();
  process.env.MONGODB_URI = `${baseUri}test_twitter_db`;
  
  console.log('🗄️ MongoDB Memory Server iniciado');
  console.log('📊 URI base:', baseUri);
  console.log('📊 URI completa:', process.env.MONGODB_URI);
});

afterAll(async () => {
  // Cleanup después de todos los tests
  if (mongoServer) {
    await mongoServer.stop();
    console.log('🗄️ MongoDB Memory Server detenido');
  }
  console.log('E2E Tests completed');
});

// Helper para limpiar la base de datos entre tests
export const clearDatabase = async (connection: Connection) => {
  if (!connection.db) {
    console.warn('⚠️ No hay conexión a la base de datos');
    return;
  }
  
  try {
    const collections = await connection.db.collections();
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    console.log('🧹 Base de datos limpiada');
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
  }
};