'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { FormField } from '@/lib/types/registration'

interface FormFieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function FormFieldEditor({ field, onUpdate }: FormFieldEditorProps) {
  const [localField, setLocalField] = useState(field)

  useEffect(() => {
    setLocalField(field)
  }, [field])

  const handleChange = (key: keyof FormField, value: any) => {
    const updated = { ...localField, [key]: value }
    setLocalField(updated)
    onUpdate({ [key]: value })
  }

  const handleValidationChange = (key: string, value: any) => {
    const validation = { ...localField.validation, [key]: value }
    const updated = { ...localField, validation }
    setLocalField(updated)
    onUpdate({ validation })
  }

  const addOption = () => {
    const options = [...(localField.options || []), `Option ${(localField.options?.length || 0) + 1}`]
    handleChange('options', options)
  }

  const updateOption = (index: number, value: string) => {
    const options = [...(localField.options || [])]
    options[index] = value
    handleChange('options', options)
  }

  const removeOption = (index: number) => {
    const options = [...(localField.options || [])]
    options.splice(index, 1)
    handleChange('options', options)
  }

  const hasOptions = ['select', 'checkbox', 'radio'].includes(field.type)
  const hasValidation = ['text', 'textarea', 'number'].includes(field.type)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="field-label">Field Label</Label>
          <Input
            id="field-label"
            value={localField.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Enter field label"
          />
        </div>
        
        <div>
          <Label htmlFor="field-placeholder">Placeholder Text</Label>
          <Input
            id="field-placeholder"
            value={localField.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            placeholder="Enter placeholder text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={localField.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            disabled={field.id === 'name' || field.id === 'email'}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Required field</span>
        </label>
      </div>

      {hasOptions && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Option</span>
            </Button>
          </div>
          <div className="space-y-2">
            {(localField.options || []).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {(localField.options?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasValidation && (
        <div>
          <Label className="mb-3 block">Validation Rules</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field.type === 'text' || field.type === 'textarea' ? (
              <>
                <div>
                  <Label htmlFor="min-length">Minimum Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    value={localField.validation?.minLength || ''}
                    onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="max-length">Maximum Length</Label>
                  <Input
                    id="max-length"
                    type="number"
                    value={localField.validation?.maxLength || ''}
                    onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value) || undefined)}
                    placeholder="No limit"
                    min="1"
                  />
                </div>
              </>
            ) : field.type === 'number' ? (
              <>
                <div>
                  <Label htmlFor="min-value">Minimum Value</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={localField.validation?.min || ''}
                    onChange={(e) => handleValidationChange('min', parseInt(e.target.value) || undefined)}
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <Label htmlFor="max-value">Maximum Value</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={localField.validation?.max || ''}
                    onChange={(e) => handleValidationChange('max', parseInt(e.target.value) || undefined)}
                    placeholder="No maximum"
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}