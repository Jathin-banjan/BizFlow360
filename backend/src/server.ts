import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  // 1. Start HTTP Server immediately so Render / cloud host health check responds
  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(`BizFlow 360 API Server listening on 0.0.0.0:${config.port} [${config.nodeEnv}]`);
    logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
  });

  // 2. Connect Database with retry
  try {
    await connectDatabase();
  } catch (err: any) {
    logger.warn('Initial MongoDB connection failed. Server will keep running and retry in 5s.', {
      error: err.message,
      uri: config.mongoUri.replace(/:([^:@]{3,})@/, ':****@'), // redact password in log
    });

    if (config.nodeEnv === 'production' && config.mongoUri.includes('127.0.0.1')) {
      logger.warn(
        'Running in production with default local MongoDB URI. Please configure MONGODB_URI in your Render environment variables with your MongoDB Atlas connection string.'
      );
    }

    // Attempt periodic reconnect
    const retryInterval = setInterval(async () => {
      try {
        await connectDatabase();
        clearInterval(retryInterval);
      } catch (retryErr: any) {
        logger.debug('Retrying MongoDB connection...', { error: retryErr.message });
      }
    }, 5000);
  }

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} signal received. Closing HTTP server.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
