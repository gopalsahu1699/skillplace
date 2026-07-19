'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

interface LoadingButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, disabled, className, ...props }, ref) => {
    const { pending } = useFormStatus()
    const isLoading = loading ?? pending

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn('relative', isLoading && 'cursor-not-allowed', className)}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  },
)

LoadingButton.displayName = 'LoadingButton'
