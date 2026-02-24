// Winston logger implementation
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import type { ILogger, LogMeta } from '~/contracts/config-types'

export function createWinstonLogger(options: {
  level: string
  format: 'json' | 'text'
  environment: 'development' | 'staging' | 'production'
}): ILogger {
  const transports: winston.transport[] = []

  // Console transport (always added)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: options.environment === 'development' }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${level}]: ${message} ${metaStr}`
        })
      ),
    })
  )

  // File transport (production only)
  if (options.environment === 'production') {
    transports.push(
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    )

    transports.push(
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    )
  }

  const winstonLogger = winston.createLogger({
    level: options.level,
    transports,
  })

  // Convert to ILogger interface
  return {
    error: (message: string, meta?: LogMeta) => {
      winstonLogger.error(message, meta)
    },
    warn: (message: string, meta?: LogMeta) => {
      winstonLogger.warn(message, meta)
    },
    info: (message: string, meta?: LogMeta) => {
      winstonLogger.info(message, meta)
    },
    http: (message: string, meta?: LogMeta) => {
      winstonLogger.http(message, meta)
    },
    debug: (message: string, meta?: LogMeta) => {
      winstonLogger.debug(message, meta)
    },
  }
}
