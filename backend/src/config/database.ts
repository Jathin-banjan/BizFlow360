import fs from 'fs';
import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';
import { seedDatabase } from '../seed/seedData.js';

let memServer: any = null;

function getSystemMongodPath(): string | undefined {
  if (process.env.MONGOMS_SYSTEM_BINARY && fs.existsSync(process.env.MONGOMS_SYSTEM_BINARY)) {
    return process.env.MONGOMS_SYSTEM_BINARY;
  }
  const candidatePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    logger.info(`✅ MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err: any) {
    logger.warn(`⚠️ Standard MongoDB connection to ${config.mongoUri} failed (${err.message}).`);
    logger.info('🚀 Spinning up in-memory MongoDB server for instant zero-config execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const systemBinary = getSystemMongodPath();
      const options = systemBinary ? { binary: { systemBinary } } : {};

      memServer = await MongoMemoryServer.create(options);
      const memUri = memServer.getUri();
      const conn = await mongoose.connect(memUri);

      logger.info(`✅ In-Memory MongoDB connected: ${conn.connection.host}`);
      logger.info('🌱 Auto-seeding in-memory database with deterministic BizFlow 360 demo data...');
      await seedDatabase(false);
      logger.info('🎉 BizFlow 360 in-memory database seeded and ready!');

      return conn;
    } catch (memErr: any) {
      logger.error('Failed to start in-memory MongoDB fallback', { error: memErr.message });
      throw memErr;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  }
  if (memServer) {
    await memServer.stop();
  }
}
