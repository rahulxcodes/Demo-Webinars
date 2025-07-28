import React from 'react'

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'error'> {
  className?: string
  error?: boolean
  helperText?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, helperText, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'