import { config } from './env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const payload = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`;
  }

  info(message: string, meta?: any) {
    console.log(this.format('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.format('error', message, meta));
  }

  debug(message: string, meta?: any) {
    if (config.logLevel === 'debug') {
      console.log(this.format('debug', message, meta));
    }
  }
}

export const logger = new Logger();
