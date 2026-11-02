import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from './env.js';
import { logger } from './logger.js';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected (${socket.id}): ${reason}`);
    });
  });

  logger.info('Socket.IO real-time WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast an event to all connected dashboard and operational clients
 */
export function broadcastEvent(event: string, payload: any): void {
  if (io) {
    io.emit(event, payload);
    logger.debug(`Broadcasted WebSocket event: ${event}`, { payload });
  }
}
