import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const setupTestDatabase = async (): Promise<string> => {
  if (mongoServer) {
    return mongoServer.getUri();
  }

  console.log('Starting MongoDB Memory Server...');
  
  mongoServer = await MongoMemoryServer.create({
    binary: {
      downloadDir: './node_modules/.cache/mongodb-memory-server',
    },
  });

  const uri = mongoServer.getUri();
  console.log(`MongoDB Memory Server started at: ${uri}`);
  
  process.env.MONGODB_URI = uri;
  
  return uri;
};

export const teardownTestDatabase = async () => {
  if (mongoServer) {
    console.log('Stopping MongoDB Memory Server...');
    await mongoServer.stop();
    mongoServer = null;
  }
};
