// Configuration error
import { AppError } from './AppError'
import type { ConfigErrorJson } from '~/contracts/config-types'

export class ConfigError extends AppError {
  constructor(
    message: string,
    public readonly configKey: string,
    public readonly expectedType?: string
  ) {
    super(message, 'CONFIG_ERROR', 500)
    this.isOperational = false // Config errors are not recoverable
  }

  toJSON(): ConfigErrorJson {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
      expectedType: this.expectedType,
    }
  }
}
