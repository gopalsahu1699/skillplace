import { toast } from 'sonner'
import type { BaseAppError } from './errors/BaseAppError'
import { getErrorMessage } from './errors/ErrorMessages'
import { ErrorCodes } from './errors/ErrorCodes'

type PromiseToastData<T = unknown> =
  | { success: T; message: string }
  | { error: unknown; message: string }
  | { data: T }

interface NotificationOptions {
  duration?: number
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  important?: boolean
  dismissible?: boolean
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const defaultOptions: Partial<NotificationOptions> = {
  duration: 4000,
  position: 'top-right',
  dismissible: true,
}

function resolveOptions(options?: NotificationOptions) {
  return { ...defaultOptions, ...options }
}

export const notify = {
  success(message: string, options?: NotificationOptions) {
    const opts = resolveOptions(options)
    return toast.success(message, {
      duration: opts.duration,
      position: opts.position,
      description: opts.description,
      action: opts.action,
    })
  },

  error(errorOrMessage: string | BaseAppError, options?: NotificationOptions) {
    const opts = resolveOptions(options)

    if (typeof errorOrMessage === 'string') {
      return toast.error(errorOrMessage, {
        duration: opts.duration,
        position: opts.position,
        description: opts.description,
        action: opts.action,
      })
    }

    const appError = errorOrMessage
    const msg = getErrorMessage(appError.code)
    const refId = appError.referenceId

    return toast.error(msg.title, {
      duration: opts.duration,
      position: opts.position,
      description: appError.userMessage || msg.description,
      action: opts.action,
    })
  },

  warning(message: string, options?: NotificationOptions) {
    const opts = resolveOptions(options)
    return toast.warning(message, {
      duration: opts.duration,
      position: opts.position,
      description: opts.description,
      action: opts.action,
    })
  },

  info(message: string, options?: NotificationOptions) {
    const opts = resolveOptions(options)
    return toast.info(message, {
      duration: opts.duration,
      position: opts.position,
      description: opts.description,
      action: opts.action,
    })
  },

  loading(message: string, options?: NotificationOptions) {
    const opts = resolveOptions(options)
    return toast.loading(message, {
      duration: opts.duration,
      position: opts.position,
      description: opts.description,
    })
  },

  dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
    options?: NotificationOptions,
  ) {
    const opts = resolveOptions(options)
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: opts.duration,
      position: opts.position,
    })
  },

  // -- Domain-specific convenience methods (backward compat) --

  loginSuccess(name?: string) {
    return this.success(`Welcome back, ${name || 'Student'}!`)
  },
  loginError(msg?: string) {
    return this.error(msg || 'Login failed. Please check your credentials.')
  },
  registerSuccess() {
    return this.success('Account created successfully! Please check your email.')
  },
  registerError(msg?: string) {
    return this.error(msg || 'Registration failed. Please try again.')
  },
  logoutSuccess() {
    return this.success('Logged out successfully!')
  },
  resetPasswordEmailSent() {
    return this.success('Password reset link sent! Check your email.')
  },

  enrollSuccess(courseName?: string) {
    return this.success(`Successfully enrolled${courseName ? ` in ${courseName}` : ''}!`)
  },
  enrollError(msg?: string) {
    return this.error(msg || 'Enrollment failed. Please try again.')
  },
  paymentSuccess() {
    return this.success('Payment successful! You now have access to the course.')
  },
  paymentError(msg?: string) {
    return this.error(msg || 'Payment failed. Please try again.')
  },
  paymentCancelled() {
    return this.info('Payment cancelled.')
  },
  paymentRedirecting() {
    return this.info('Redirecting to payment...')
  },

  lessonComplete(title?: string) {
    return this.success(`Lesson completed${title ? `: ${title}` : ''}`)
  },
  quizSubmitted(score?: number) {
    return this.success(`Quiz submitted! Score: ${score}%`)
  },
  quizFailed() {
    return this.error('Quiz not passed. Please try again.')
  },

  networkError() {
    return this.error('Unable to connect to our server. Please check your internet connection and try again.')
  },
  serverError() {
    return this.error('Something went wrong on our side. Please try again in a few moments.')
  },
  unauthorized() {
    return this.error('Please login to continue.')
  },
  sessionExpired() {
    return this.warning('Your session has expired. Please sign in again.')
  },
  genericError(msg?: string) {
    return this.error(msg || 'Something went wrong. Please try again.')
  },

  connectionRestored() {
    return this.success('Connection restored.')
  },
  offline() {
    return this.warning('You are currently offline. Some features may not work.', {
      duration: 6000,
      important: true,
    })
  },
}
