import app from './app.js';
import { config } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

async function bootstrap() {
  try {
    // 1. Connect Database
    await connectDatabase();

    // 2. Start HTTP Server
    const server = app.listen(config.port, () => {
      logger.info(`BizFlow 360 API Server running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`Health check available at http://localhost:${config.port}/api/v1/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} signal received. Closing HTTP server and database connections.`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.error('Fatal error during application startup', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

bootstrap();
