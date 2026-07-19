import { BaseAppError } from './BaseAppError'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  code?: string
  referenceId?: string
  userId?: string
  route?: string
  browser?: string
  device?: string
  stack?: string
  details?: unknown
}

class ErrorLoggerService {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private log(level: LogLevel, message: string, data?: Partial<LogEntry>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    if (process.env.NODE_ENV === 'development') {
      this.devLog(entry)
    } else {
      this.prodLog(entry)
    }
  }

  private devLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const ref = entry.referenceId ? ` (Ref: ${entry.referenceId})` : ''

    switch (entry.level) {
      case 'error':
        console.error(`${prefix}${ref} ${entry.message}`, entry.details ?? '', entry.stack ?? '')
        break
      case 'warn':
        console.warn(`${prefix}${ref} ${entry.message}`, entry.details ?? '')
        break
      case 'info':
        console.info(`${prefix}${ref} ${entry.message}`, entry.details ?? '')
        break
      case 'debug':
        console.debug(`${prefix}${ref} ${entry.message}`, entry.details ?? '')
        break
    }
  }

  private prodLog(entry: LogEntry): void {
    const structured = JSON.stringify({
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      code: entry.code,
      referenceId: entry.referenceId,
      userId: entry.userId,
      route: entry.route,
      browser: entry.browser,
      device: entry.device,
      ...(entry.details ? { details: entry.details } : {}),
    })

    if (entry.level === 'error') {
      console.error(structured)
    } else if (entry.level === 'warn') {
      console.warn(structured)
    } else {
      console.log(structured)
    }
  }

  error(message: string, error?: unknown, context?: Partial<LogEntry>): void {
    const appError = error instanceof BaseAppError ? error : undefined
    this.log('error', message, {
      code: appError?.code,
      referenceId: appError?.referenceId,
      stack: error instanceof Error ? error.stack : undefined,
      details: appError?.details ?? error,
      ...context,
    })
  }

  warn(message: string, data?: unknown, context?: Partial<LogEntry>): void {
    this.log('warn', message, {
      details: data,
      ...context,
    })
  }

  info(message: string, data?: unknown, context?: Partial<LogEntry>): void {
    this.log('info', message, {
      details: data,
      ...context,
    })
  }

  debug(message: string, data?: unknown, context?: Partial<LogEntry>): void {
    this.log('debug', message, {
      details: data,
      ...context,
    })
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}

export const errorLogger = new ErrorLoggerService()
