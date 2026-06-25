import winston from 'winston';

const maxLogFileSize = 10 * 1024 * 1024;
const maxLogFiles = 5;

const sensitiveQueryKeys = new Set([
  'access_token',
  'accessToken',
  'token',
  'jwt',
  'password',
  'signature',
  'secret',
  'api_key',
  'apiKey'
]);

export const sanitizeUrlForLogging = (value: string) => {
  try {
    const parsed = new URL(value, 'http://localhost');
    const keys = Array.from(new Set(parsed.searchParams.keys()));
    for (const key of keys) {
      if (sensitiveQueryKeys.has(key)) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    }

    const query = parsed.searchParams.toString();
    return `${parsed.pathname}${query ? `?${query}` : ''}`;
  } catch {
    return value;
  }
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message} ${info.stack ? '\n' + info.stack : ''}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: maxLogFileSize,
      maxFiles: maxLogFiles,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: maxLogFileSize,
      maxFiles: maxLogFiles,
      tailable: true
    })
  ]
});

export default logger;
