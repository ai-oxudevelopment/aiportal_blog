import type { ILogger } from '~/contracts/config-types'

// Singleton logger instance
let loggerInstance: ILogger | null = null

export function setLogger(logger: ILogger): void {
  loggerInstance = logger
}

export function getLogger(): ILogger {
  if (!loggerInstance) {
    // Fallback to console if logger not initialized
    return createConsoleLogger()
  }
  return loggerInstance
}

// Server-side logger with event context
export function getLoggerFromEvent(event: any): ILogger {
  if (!loggerInstance) {
    return createConsoleLogger()
  }

  // Create a logger bound to the event context
  const traceContext = event.context?.traceContext

  return {
    error: (message: string, meta?: Record<string, unknown>) => {
      loggerInstance!.error(message, {
        ...meta,
        traceContext,
      })
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      loggerInstance!.warn(message, {
        ...meta,
        traceContext,
      })
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      loggerInstance!.info(message, {
        ...meta,
        traceContext,
      })
    },
    http: (message: string, meta?: Record<string, unknown>) => {
      loggerInstance!.http(message, {
        ...meta,
        traceContext,
      })
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      loggerInstance!.debug(message, {
        ...meta,
        traceContext,
      })
    },
  }
}

function createConsoleLogger(): ILogger {
  return {
    error: (message: string, meta?: Record<string, unknown>) => {
      console.error('[ERROR]', message, meta || '')
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      console.warn('[WARN]', message, meta || '')
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      console.info('[INFO]', message, meta || '')
    },
    http: (message: string, meta?: Record<string, unknown>) => {
      console.log('[HTTP]', message, meta || '')
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      console.log('[DEBUG]', message, meta || '')
    },
  }
}
