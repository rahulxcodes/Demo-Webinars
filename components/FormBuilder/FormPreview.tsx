'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormField } from '@/lib/types/registration'

interface FormPreviewProps {
  fields: FormField[]
}

export function FormPreview({ fields }: FormPreviewProps) {
  const renderField = (field: FormField) => {
    const baseProps = {
      id: field.id,
      placeholder: field.placeholder,
      required: field.required,
      disabled: true, // Preview mode
    }

    switch (field.type) {
      case 'text':
      case 'email':
        return <Input {...baseProps} type={field.type} />

      case 'phone':
        return <Input {...baseProps} type="tel" />

      case 'number':
        return (
          <Input
            {...baseProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...baseProps}
            rows={3}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'select':
        return (
          <Select {...baseProps}>
            <option value="">Select an option...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  disabled
                  className="rounded-full border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  disabled
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return <Input {...baseProps} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Registration Preview</h3>
        <p className="text-sm text-gray-500">This is how your registration form will appear to attendees</p>
      </div>

      <form className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="flex items-center space-x-1">
              <span>{field.label}</span>
              {field.required && (
                <span className="text-red-500 text-sm">*</span>
              )}
            </Label>
            {renderField(field)}
          </div>
        ))}

        <div className="pt-4">
          <Button disabled className="w-full">
            Register for Webinar
          </Button>
        </div>
      </form>

      <div className="text-xs text-gray-500 italic">
        * This is a preview only. The form is disabled in preview mode.
      </div>
    </div>
  )
}