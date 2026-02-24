// API-specific error
import { AppError } from './AppError'
import type { ApiErrorJson } from '~/contracts/config-types'

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
