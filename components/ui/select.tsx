import React from 'react'
import clsx from 'clsx'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  helperText?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              'flex h-11 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {helperText && (
          <p className={clsx(
            'mt-1 text-xs',
            error ? 'text-error-600' : 'text-gray-500'
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }