import { errorLogger } from './errors/ErrorLogger'
import type { LogEntry } from './errors/ErrorLogger'

export const logger = {
  error(message: string, error?: unknown, context?: Partial<LogEntry>) {
    errorLogger.error(message, error, context)
  },

  warn(message: string, data?: unknown, context?: Partial<LogEntry>) {
    errorLogger.warn(message, data, context)
  },

  info(message: string, data?: unknown, context?: Partial<LogEntry>) {
    errorLogger.info(message, data, context)
  },

  debug(message: string, data?: unknown, context?: Partial<LogEntry>) {
    errorLogger.debug(message, data, context)
  },
}
