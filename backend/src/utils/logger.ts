// backend/src/utils/logger.ts
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'glambook-api' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Safe stringify to handle circular references
          const safeMeta = Object.keys(meta).length ? 
            JSON.stringify(meta, (key, value) => {
              if (typeof value === 'object' && value !== null) {
                if (value.constructor && value.constructor.name === 'ClientRequest') {
                  return '[ClientRequest]';
                }
                if (value.constructor && value.constructor.name === 'IncomingMessage') {
                  return '[IncomingMessage]';
                }
                if (value.constructor && value.constructor.name === 'ServerResponse') {
                  return '[ServerResponse]';
                }
              }
              return value;
            }, 2) : '';
          return `${timestamp} [${level}]: ${message} ${safeMeta}`;
        })
      ),
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export { logger };