import http from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  // 1. Create HTTP server and attach Socket.IO
  const httpServer = http.createServer(app);
  initializeSocket(httpServer);

  // 2. Start HTTP & WebSocket Server immediately so Render / Railway health checks respond
  httpServer.listen(config.port, '0.0.0.0', () => {
    logger.info(`BizFlow 360 Express + Socket.IO Server listening on 0.0.0.0:${config.port} [${config.nodeEnv}]`);
    logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
  });

  // 3. Connect Database with auto-reconnect
  try {
    await connectDatabase();
  } catch (err: any) {
    logger.warn('Initial MongoDB connection failed. Server will keep running and retry in 5s.', {
      error: err.message,
      uri: config.mongoUri.replace(/:([^:@]{3,})@/, ':****@'),
    });

    if (config.nodeEnv === 'production' && config.mongoUri.includes('127.0.0.1')) {
      logger.warn(
        'Running in production with default local MongoDB URI. Please configure MONGODB_URI in your Render / Railway environment variables.'
      );
    }

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
    logger.info(`${signal} signal received. Closing HTTP and WebSocket server.`);
    httpServer.close(() => {
      logger.info('Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
