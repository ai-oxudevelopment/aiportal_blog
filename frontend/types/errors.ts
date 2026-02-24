// Error Type Definitions
export interface ErrorJson {
  name: string
  code: string
  message: string
  statusCode: number
}

export interface LogMeta {
  traceContext?: {
    requestId: string
    userId?: string
    sessionId?: string
  }
  error?: ErrorJson
  component?: string
  lifecycleHook?: string
  [key: string]: unknown
}

export interface UserFriendlyMessage {
  title: string
  message: string
  canRetry: boolean
}
