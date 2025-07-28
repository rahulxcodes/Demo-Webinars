'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

const DEFAULT_FIELDS = [
  {
    id: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    order: 0,
    isDefault: true
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email address',
    required: true,
    order: 1,
    isDefault: true
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Mobile Number',
    placeholder: 'Enter your mobile number',
    required: false,
    order: 2,
    isDefault: true
  }
]

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'Website URL' },
]

interface FormField {
  id: string
  type: string
  label: string
  placeholder: string
  required: boolean
  order: number
  isDefault?: boolean
  options?: string[]
}

interface RegistrationFormBuilderProps {
  webinarId: string
  initialFormSchema?: any
  onSave?: (formData: any) => void
}

export function RegistrationFormBuilder({ 
  webinarId, 
  initialFormSchema, 
  onSave 
}: RegistrationFormBuilderProps) {
  const [enabled, setEnabled] = useState(true)
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FIELDS)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    autoApprove: true,
    maxAttendees: undefined as number | undefined,
    registrationDeadline: undefined as number | undefined,
    waitingList: false,
    sendConfirmation: true
  })

  useEffect(() => {
    if (initialFormSchema?.fields) {
      setFields(initialFormSchema.fields)
    }
  }, [initialFormSchema])

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} Field`,
      placeholder: '',
      required: false,
      order: fields.length,
      isDefault: false
    }

    if (['select', 'radio', 'checkbox'].includes(fieldType)) {
      newField.options = ['Option 1', 'Option 2']
    }

    setFields([...fields, newField])
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ))
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId))
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    
    // Update order values
    newFields.forEach((field, index) => {
      field.order = index
    })
    
    setFields(newFields)
  }

  const saveForm = async () => {
    setSaving(true)
    try {
      const formData = {
        requireRegistration: enabled,
        formSchema: {
          fields: fields,
          version: 1
        },
        ...settings
      }

      const response = await fetch(`/api/webinars/${webinarId}/registration-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave?.(formData)
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save form:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Registration Toggle */}
      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Require Registration</h3>
            <p className="text-gray-600">Attendees must register before joining</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </CardBody>
      </Card>

      {enabled && (
        <>
          {/* Form Builder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">Registration Form Fields</h3>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  {showPreview ? 'Edit Form' : 'Preview Form'}
                </Button>
                <Button onClick={saveForm} disabled={saving} size="sm">
                  {saving ? 'Saving...' : 'Save Form'}
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {!showPreview ? (
                <div className="space-y-4">
                  {/* Field List */}
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Bars3Icon className="h-4 w-4 text-gray-400 cursor-move" />
                          <span className="text-sm font-medium text-gray-700">
                            {field.label} ({field.type})
                          </span>
                          {field.required && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {!field.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteField(field.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Field Label"
                          />
                        </div>
                        <div>
                          <Label>Placeholder Text</Label>
                          <Input
                            value={field.placeholder}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder Text"
                          />
                        </div>
                      </div>
                      
                      {!field.isDefault && (
                        <div className="mt-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="mr-2 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Required Field</span>
                          </label>
                        </div>
                      )}

                      {field.options && (
                        <div className="mt-3">
                          <Label>Options</Label>
                          <div className="space-y-2">
                            {field.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(field.options || [])]
                                    newOptions[optionIndex] = e.target.value
                                    updateField(field.id, { options: newOptions })
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newOptions = [...(field.options || [])]
                                    newOptions.splice(optionIndex, 1)
                                    updateField(field.id, { options: newOptions })
                                  }}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                                updateField(field.id, { options: newOptions })
                              }}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Field Dropdown */}
                  <div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addField(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2 bg-white"
                      defaultValue=""
                    >
                      <option value="">+ Add Custom Field</option>
                      {FIELD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <FormPreview fields={fields} />
              )}
            </CardBody>
          </Card>

          {/* Registration Settings */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Registration Settings</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-approve registrations</Label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.autoApprove}
                      onChange={(e) => setSettings({...settings, autoApprove: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Send confirmation emails</Label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.sendConfirmation}
                      onChange={(e) => setSettings({...settings, sendConfirmation: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Maximum attendees</Label>
                  <Input
                    type="number"
                    value={settings.maxAttendees?.toString() || ''}
                    onChange={(e) => setSettings({...settings, maxAttendees: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label>Registration deadline (hours before webinar)</Label>
                  <Input
                    type="number"
                    value={settings.registrationDeadline?.toString() || ''}
                    onChange={(e) => setSettings({...settings, registrationDeadline: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="No deadline"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}

// Form Preview Component
function FormPreview({ fields }: { fields: FormField[] }) {
  return (
    <div className="border rounded-lg p-6 bg-white max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Registration Form Preview</h3>
      <form className="space-y-4">
        {fields.map((field) => (
          <div key={field.id}>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === 'text' && (
              <Input
                type="text"
                placeholder={field.placeholder}
                disabled
              />
            )}
            
            {field.type === 'email' && (
              <Input
                type="email"
                placeholder={field.placeholder}
                disabled
              />
            )}
            
            {field.type === 'phone' && (
              <Input
                type="tel"
                placeholder={field.placeholder}
                disabled
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                placeholder={field.placeholder}
                rows={3}
                className="w-full border rounded-md px-3 py-2"
                disabled
              />
            )}
            
            {field.type === 'select' && (
              <select className="w-full border rounded-md px-3 py-2" disabled>
                <option>Select an option</option>
                {field.options?.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2">
                {field.options?.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                    <input type="radio" name={field.id} className="mr-2" disabled />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="space-y-2">
                {field.options?.map((option, idx) => (
                  <label key={idx} className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {field.type === 'number' && (
              <Input
                type="number"
                placeholder={field.placeholder}
                disabled
              />
            )}

            {field.type === 'date' && (
              <Input
                type="date"
                disabled
              />
            )}

            {field.type === 'url' && (
              <Input
                type="url"
                placeholder={field.placeholder}
                disabled
              />
            )}
          </div>
        ))}
        
        <Button className="w-full" disabled>
          Register for Webinar
        </Button>
      </form>
    </div>
  )
}