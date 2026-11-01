import dotenv from 'dotenv';
import path from 'path';

// Load environment configuration
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizflow360',
  jwtSecret: process.env.JWT_SECRET || 'bizflow360_super_secret_jwt_key_for_development_purposes_only_32_chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};
