// User-friendly error messages
import { AppError, ApiError, ValidationError, NetworkError, ConfigError } from '~/infrastructure/errors'

export const errorMessages: Record<string, { title: string; message: string; canRetry: boolean }> = {
  API_ERROR: {
    title: 'Service Unavailable',
    message: 'Unable to connect to the service. Please try again later.',
    canRetry: true,
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    canRetry: false,
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to reach the server. Please check your connection.',
    canRetry: true,
  },
  CONFIG_ERROR: {
    title: 'Configuration Error',
    message: 'The application is not configured correctly. Please contact support.',
    canRetry: false,
  },
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource was not found.',
    canRetry: false,
  },
  UNAUTHORIZED: {
    title: 'Unauthorized',
    message: 'You need to log in to access this resource.',
    canRetry: false,
  },
}

export function getUserFriendlyMessage(
  error: Error,
  statusCode?: number
): { title: string; message: string; canRetry: boolean } {
  // Check for AppError with code
  if (error instanceof AppError) {
    return errorMessages[error.code] || errorMessages.API_ERROR
  }

  // Map HTTP status codes to messages
  if (statusCode) {
    const statusMessages: Record<number, ReturnType<typeof getUserFriendlyMessage>> = {
      400: errorMessages.VALIDATION_ERROR,
      401: errorMessages.UNAUTHORIZED,
      403: errorMessages.UNAUTHORIZED,
      404: errorMessages.NOT_FOUND,
      500: errorMessages.API_ERROR,
      502: errorMessages.NETWORK_ERROR,
      503: errorMessages.API_ERROR,
      504: errorMessages.NETWORK_ERROR,
    }

    return statusMessages[statusCode] || errorMessages.API_ERROR
  }

  // Default error
  return errorMessages.API_ERROR
}

export function handleApiError(error: unknown, context: { endpoint: string; method: string }): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message,
      context.endpoint,
      context.method,
      500,
      error
    )
  }

  return new ApiError(
    'Unknown error occurred',
    context.endpoint,
    context.method,
    500
  )
}
