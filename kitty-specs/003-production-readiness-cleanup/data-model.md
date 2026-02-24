# Data Model: Production Readiness Cleanup

**Feature**: 003-production-readiness-cleanup
**Phase**: 1 - Design
**Date**: 2025-02-24

---

## Overview

This document defines the data model for configuration, logging, and error handling improvements. Unlike typical data models, this focuses on **infrastructure entities** rather than business entities.

---

## Entities

### 1. Config

Centralized configuration object with type-safe access to all application settings.

```typescript
interface IConfig {
  app: AppConfig
  api: ApiConfig
  logging: LoggingConfig
  cache: CacheConfig
}

interface AppConfig {
  name: string
  version: string
  environment: 'development' | 'staging' | 'production'
  debug: boolean
}

interface ApiConfig {
  strapi: {
    url: string
    timeout: number
    retryAttempts: number
  }
  cache: {
    ttl: number
    staleWhileRevalidate: number
  }
}

interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'http' | 'debug'
  format: 'json' | 'text'
  transports: TransportConfig[]
}

interface CacheConfig {
  enabled: boolean
  ttl: number
  maxSize: number
}

interface TransportConfig {
  type: 'console' | 'file' | 'remote'
  options: Record<string, unknown>
}
```

---

### 2. Logger

Structured logging interface with context support.

```typescript
interface ILogger {
  error(message: string, meta?: LogMeta): void
  warn(message: string, meta?: LogMeta): void
  info(message: string, meta?: LogMeta): void
  http(message: string, meta?: LogMeta): void
  debug(message: string, meta?: LogMeta): void
}

interface LogMeta {
  requestId?: string
  userId?: string
  timestamp?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  meta: LogMeta
  timestamp: string
}

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug'
```

---

### 3. TraceContext

Request tracing context for distributed logging.

```typescript
interface TraceContext {
  requestId: string
  timestamp: string
  userId?: string
  sessionId?: string
  metadata: Record<string, unknown>
}

interface TraceContextOptions {
  generateId: () => string
  includeHeaders: string[]
}
```

---

### 4. AppError

Base error class for application errors.

```typescript
abstract class AppError extends Error {
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

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    }
  }
}
```

---

### 5. ApiError

API-specific error with endpoint context.

```typescript
class ApiError extends AppError {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly method: string,
    statusCode: number = 500,
    public readonly originalError?: unknown
  ) {
    super(message, 'API_ERROR', statusCode)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      endpoint: this.endpoint,
      method: this.method,
    }
  }
}
```

---

### 6. ValidationError

Validation error with field-specific details.

```typescript
class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    }
  }
}
```

---

### 7. ConfigError

Configuration error for startup failures.

```typescript
class ConfigError extends AppError {
  constructor(
    message: string,
    public readonly configKey: string
  ) {
    super(message, 'CONFIG_ERROR', 500)
    this.isOperational = false // Config errors are not recoverable
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
    }
  }
}
```

---

## State Diagrams

### Error Handling Flow

```
┌─────────────┐
│  API Call   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Success   │────▶│  Return Data │
└─────────────┘     └──────────────┘
       │
       ▼
┌─────────────────────────────┐
│      Error Occurred          │
└──────────┬──────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Wrap in ApiError                │
│  - Log error                     │
│  - Add context (endpoint, method)│
└──────────┬──────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│  Return User-Friendly Message     │
│  - Hide technical details         │
│  - Log to error tracking          │
└───────────────────────────────────┘
```

### Configuration Flow

```
┌─────────────┐
│ App Startup │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Load Environment Variables  │
└──────────┬──────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│ Validate Required Config Values   │
│ - Fail fast if missing            │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│ Apply Defaults for Optional       │
└──────────┬────────────────────────┘
           │
           ▼
┌───────────────────────────────────┐
│ Export Typed Config Object        │
│ - Available via useRuntimeConfig  │
└───────────────────────────────────┘
```

---

## Relationships

```
┌─────────────┐
│   Config    │──────────────┐
└─────────────┘              │
                             │
         ┌───────────────────┴───────────────────┐
         │                                     │
         ▼                                     ▼
┌────────────────┐                    ┌───────────────┐
│     Logger     │◀───uses───────────│ TraceContext  │
└────────────────┘                    └───────────────┘
         │
         │ logs
         ▼
┌────────────────┐
│   AppError     │◀───extends──────────┐
└────────────────┘                    │
         │                            │
         ├──────────┬─────────┬───────┤
         ▼          ▼         ▼       ▼
    ┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐
    │ApiError│ │Valid │ │Config   │ │Network   │
    └────────┘ │Error │ │Error    │ │Error     │
               └──────┘ └─────────┘ └──────────┘
```

---

## Validation Rules

### Config Validation

| Rule | Description |
|------|-------------|
| Required | All required config keys must be present |
| Type Check | Config values must match expected types |
| Range Check | Numeric values within valid ranges |
| URL Format | URLs must be valid and reachable |
| Fail Fast | Invalid config prevents app startup |

### Error Validation

| Rule | Description |
|------|-------------|
| Code | Every error must have a unique code |
| Status Code | HTTP status code appropriate for error type |
| Message | User-friendly (no technical details in user messages) |
| Operational | Mark if error is recoverable |

---

## Next Steps

1. ✅ Data model defined
2. ⏳ Generate contracts/ from interfaces
3. ⏳ Generate quickstart.md developer guide

---

**Generated**: 2025-02-24
**Phase 1 Status**: In Progress
