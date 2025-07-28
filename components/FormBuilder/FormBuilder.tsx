'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { 
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { FormField, FormSchema } from '@/lib/types/registration'
import { FormFieldEditor } from '@/components/FormBuilder/FormFieldEditor'
import { FormPreview } from '@/components/FormBuilder/FormPreview'

interface FormBuilderProps {
  initialSchema?: FormSchema
  onSave: (schema: FormSchema) => void
  loading?: boolean
}

export function FormBuilder({ initialSchema, onSave, loading = false }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(
    initialSchema?.fields || [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        order: 0,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email address',
        required: true,
        order: 1,
      },
    ]
  )
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const sortedFields = useMemo(() => 
    [...fields].sort((a, b) => a.order - b.order),
    [fields]
  )

  const addField = useCallback((type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      order: fields.length,
    }

    if (type === 'select' || type === 'checkbox' || type === 'radio') {
      newField.options = ['Option 1', 'Option 2']
    }

    setFields(prev => [...prev, newField])
    setEditingField(newField.id)
  }, [fields.length])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }, [])

  const removeField = useCallback((fieldId: string) => {
    // Don't allow removing required fields
    if (fieldId === 'name' || fieldId === 'email') return
    
    setFields(prev => prev.filter(field => field.id !== fieldId))
    setEditingField(null)
  }, [])

  const moveField = useCallback((fieldId: string, direction: 'up' | 'down') => {
    setFields(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const fieldIndex = sorted.findIndex(f => f.id === fieldId)
      
      if (fieldIndex === -1) return prev
      if (direction === 'up' && fieldIndex === 0) return prev
      if (direction === 'down' && fieldIndex === sorted.length - 1) return prev

      const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1
      
      // Swap orders
      const temp = sorted[fieldIndex].order
      sorted[fieldIndex].order = sorted[targetIndex].order
      sorted[targetIndex].order = temp

      return prev.map(field => {
        const updatedField = sorted.find(f => f.id === field.id)
        return updatedField || field
      })
    })
  }, [])

  const handleSave = useCallback(() => {
    const schema: FormSchema = {
      fields: sortedFields,
      version: (initialSchema?.version || 0) + 1,
    }
    onSave(schema)
  }, [sortedFields, initialSchema?.version, onSave])

  const fieldTypes = [
    { type: 'text' as const, label: 'Text Input', icon: '📝' },
    { type: 'textarea' as const, label: 'Long Text', icon: '📄' },
    { type: 'select' as const, label: 'Dropdown', icon: '📋' },
    { type: 'checkbox' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'radio' as const, label: 'Radio Buttons', icon: '🔘' },
    { type: 'number' as const, label: 'Number', icon: '🔢' },
    { type: 'phone' as const, label: 'Phone Number', icon: '📞' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Registration Form Builder</h2>
          <p className="text-sm text-gray-600">Create a custom registration form for your webinar</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2"
          >
            <EyeIcon className="h-4 w-4" />
            <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Builder */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Add Fields</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {fieldTypes.map((fieldType) => (
                  <Button
                    key={fieldType.type}
                    variant="outline"
                    onClick={() => addField(fieldType.type)}
                    className="flex items-center space-x-2 h-12"
                  >
                    <span className="text-lg">{fieldType.icon}</span>
                    <span className="text-sm">{fieldType.label}</span>
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Field List */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Form Fields</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {sortedFields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    editingField === field.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                          className="p-1 h-6 w-6"
                        >
                          <ArrowUpIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === sortedFields.length - 1}
                          className="p-1 h-6 w-6"
                        >
                          <ArrowDownIcon className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{field.label}</h4>
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 capitalize">{field.type} field</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                      {field.id !== 'name' && field.id !== 'email' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {editingField === field.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <FormFieldEditor
                        field={field}
                        onUpdate={(updates: Partial<FormField>) => updateField(field.id, updates)}
                      />
                    </div>
                  )}
                </div>
              ))}

              {sortedFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No fields added yet. Use the buttons above to add fields to your form.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Form Preview</h3>
              </CardHeader>
              <CardBody>
                <FormPreview fields={sortedFields} />
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}