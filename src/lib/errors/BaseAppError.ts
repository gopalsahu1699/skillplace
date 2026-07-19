import { ErrorCodes, type ErrorCode } from './ErrorCodes'

export class BaseAppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly referenceId: string
  public readonly details?: unknown
  public readonly userMessage: string
  public readonly userTitle: string
  public readonly actionable: boolean
  public readonly timestamp: string

  constructor(
    message: string,
    options: {
      code?: ErrorCode
      statusCode?: number
      referenceId?: string
      details?: unknown
      userMessage?: string
      userTitle?: string
      actionable?: boolean
      cause?: unknown
    } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = this.constructor.name
    this.code = options.code ?? ErrorCodes.UNKNOWN
    this.statusCode = options.statusCode ?? 500
    this.referenceId = options.referenceId ?? generateReferenceId()
    this.details = options.details
    this.userMessage = options.userMessage ?? message
    this.userTitle = options.userTitle ?? 'Something went wrong'
    this.actionable = options.actionable ?? false
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      referenceId: this.referenceId,
      userTitle: this.userTitle,
      userMessage: this.userMessage,
      timestamp: this.timestamp,
    }
  }
}

let counter = 0

export function generateReferenceId(): string {
  const year = new Date().getFullYear()
  counter++
  const seq = String(counter).padStart(6, '0')
  return `ERR-${year}-${seq}`
}

export function resetReferenceCounter(): void {
  counter = 0
}
