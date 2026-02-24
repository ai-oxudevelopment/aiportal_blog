// Validation error
import { AppError } from './AppError'
import type { ValidationErrorJson } from '~/contracts/config-types'

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
