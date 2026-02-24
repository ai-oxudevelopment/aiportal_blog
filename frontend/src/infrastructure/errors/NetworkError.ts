// Network error
import { AppError } from './AppError'
import type { NetworkErrorJson } from '~/contracts/config-types'

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
