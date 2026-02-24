// Trace context for request tracing
import type { TraceContext, TraceContextOptions } from '~/contracts/config-types'

// Store trace context globally for server-side requests
let currentContext: TraceContext | null = null

export function createTraceContext(options?: Partial<TraceContextOptions>): TraceContext {
  return {
    requestId: options?.generateId?.() || generateRequestId(),
    timestamp: new Date().toISOString(),
    userId: options?.userId,
    sessionId: options?.sessionId,
    metadata: options?.metadata || {},
  }
}

export function getTraceContext(): TraceContext | null {
  return currentContext
}

export function setTraceContext(context: TraceContext): void {
  currentContext = context
}

export function clearTraceContext(): void {
  currentContext = null
}

export function withTraceContext<T>(context: TraceContext, fn: () => T): T {
  const previous = currentContext
  currentContext = context
  try {
    return fn()
  } finally {
    currentContext = previous
  }
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

// Extract request ID from headers (server middleware)
export function extractRequestId(headers: Headers): string | undefined {
  return headers.get('x-request-id') || undefined
}
