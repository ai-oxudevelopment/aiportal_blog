/**
 * Configuration and Error Handling Contracts
 * Feature: 003-production-readiness-cleanup
 * Phase: 1 - Design
 */

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

/**
 * Main configuration interface
 * Provides type-safe access to all application settings
 */
export interface IConfig {
  app: AppConfig
  api: ApiConfig
  logging: LoggingConfig
  cache: CacheConfig
}

/**
 * Application-level configuration
 */
export interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean
}

/**
 * API configuration for external services
 */
export interface ApiConfig {
  strapi: StrapiConfig
  cache: ApiCacheConfig
}

/**
 * Strapi CMS specific configuration
 */
export interface StrapiConfig {
  url: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * API caching configuration
 */
export interface ApiCacheConfig {
  ttl: number
  staleWhileRevalidate: number
  enabled: boolean
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: LogLevel
  format: LogFormat
  transports: TransportConfig[]
  requestIdHeader: string
}

/**
 * Log levels (following RFC 5424)
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug'

/**
 * Log output format
 */
export type LogFormat = 'json' | 'text'

/**
 * Transport configuration for logging
 */
export interface TransportConfig {
  type: 'console' | 'file' | 'remote'
  options: TransportOptions
}

/**
 * Transport-specific options
 */
export interface TransportOptions {
  filename?: string
  maxsize?: number
  maxFiles?: number
  level?: LogLevel
  format?: LogFormat
  colorize?: boolean
  [key: string]: unknown
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
  maxSizeBytes: number
}

// ============================================================================
// LOGGING INTERFACES
// ============================================================================

/**
 * Structured logger interface
 */
export interface ILogger {
  error(message: string, meta?: LogMeta): void
  warn(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  http(message: string, meta?: LogMeta): void
  debug(message: string, meta?: LogMeta): void
}

/**
 * Log metadata for context
 */
export interface LogMeta {
  requestId?: string
  userId?: string
  sessionId?: string
  timestamp?: string
  duration?: number
  [key: string]: unknown
}

/**
 * Complete log entry
 */
export interface LogEntry {
  level: LogLevel
  message: string
  meta: LogMeta
  timestamp: string
}

// ============================================================================
// TRACE CONTEXT INTERFACES
// ============================================================================

/**
 * Request trace context for distributed logging
 */
export interface TraceContext {
  requestId: string
  timestamp: string
  userId?: string
  sessionId?: string
  metadata: Record<string, unknown>
}

/**
 * Options for trace context generation
 */
export interface TraceContextOptions {
  generateId: () => string
  includeHeaders: string[]
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base application error class
 * All custom errors should extend this class
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): ErrorJson {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    }
  }
}

/**
 * Error JSON representation
 */
export interface ErrorJson {
  name: string
  code: string
  message: string
  statusCode: number
}

/**
 * API-specific error
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly method: string,
    statusCode: number = 500,
    public readonly originalError?: unknown
  ) {
    super(message, 'API_ERROR', statusCode)
  }

  toJSON(): ApiErrorJson {
    return {
      ...super.toJSON(),
      endpoint: this.endpoint,
      method: this.method,
    }
  }
}

/**
 * API error JSON representation
 */
export interface ApiErrorJson extends ErrorJson {
  endpoint: string
  method: string
}

/**
 * Validation error with field-specific details
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400)
  }

  toJSON(): ValidationErrorJson {
    return {
      ...super.toJSON(),
      fields: this.fields,
    }
  }
}

/**
 * Validation error JSON representation
 */
export interface ValidationErrorJson extends ErrorJson {
  fields: Record<string, string[]>
}

/**
 * Configuration error (non-recoverable)
 */
export class ConfigError extends AppError {
  constructor(
    message: string,
    public readonly configKey: string,
    public readonly expectedType?: string
  ) {
    super(message, 'CONFIG_ERROR', 500)
    this.isOperational = false
  }

  toJSON(): ConfigErrorJson {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
      expectedType: this.expectedType,
    }
  }
}

/**
 * Config error JSON representation
 */
export interface ConfigErrorJson extends ErrorJson {
  configKey: string
  expectedType?: string
}

/**
 * Network error for connectivity issues
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    public readonly url: string,
    public readonly originalError?: unknown
  ) {
    super(message, 'NETWORK_ERROR', 503)
  }

  toJSON(): NetworkErrorJson {
    return {
      ...super.toJSON(),
      url: this.url,
    }
  }
}

/**
 * Network error JSON representation
 */
export interface NetworkErrorJson extends ErrorJson {
  url: string
}

// ============================================================================
// ERROR HANDLER INTERFACES
// ============================================================================

/**
 * Error handler function type
 */
export type ErrorHandler = (error: Error, context: ErrorContext) => void

/**
 * Error context for handlers
 */
export interface ErrorContext {
  component?: string
  route?: string
  userId?: string
  requestId?: string
  [key: string]: unknown
}

/**
 * User-facing error message
 */
export interface UserErrorMessage {
  title: string
  message: string
  action?: string
  canRetry: boolean
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Config
  IConfig,
  AppConfig,
  ApiConfig,
  StrapiConfig,
  ApiCacheConfig,
  LoggingConfig,
  CacheConfig,

  // Logging
  ILogger,
  LogMeta,
  LogEntry,
  LogLevel,
  LogFormat,
  TransportConfig,
  TransportOptions,

  // Trace
  TraceContext,
  TraceContextOptions,

  // Errors
  AppError,
  ApiError,
  ValidationError,
  ConfigError,
  NetworkError,

  // Error Handler
  ErrorHandler,
  ErrorContext,
  UserErrorMessage,
}
