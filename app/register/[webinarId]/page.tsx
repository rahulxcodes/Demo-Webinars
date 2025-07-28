'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { FormField, RegistrationFormConfig } from '@/lib/types/registration'
import { Webinar } from '@/lib/types'

export default function RegisterPage() {
  const params = useParams()
  const webinarId = params.webinarId as string
  
  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [registrationResult, setRegistrationResult] = useState<any>(null)

  useEffect(() => {
    fetchRegistrationForm()
  }, [webinarId])

  const fetchRegistrationForm = async () => {
    try {
      const response = await fetch(`/api/webinars/${webinarId}/registration`)
      if (response.ok) {
        const data = await response.json()
        setRegistrationForm(data.registrationForm)
        setWebinar(data.registrationForm.webinar)
      } else {
        console.error('Registration form not found')
      }
    } catch (error) {
      console.error('Error fetching registration form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const formSchema = registrationForm?.formSchema as { fields: FormField[] }

    if (!formSchema) return false

    for (const field of formSchema.fields) {
      if (field.required) {
        const value = formData[field.id]
        if (!value || value.toString().trim() === '') {
          newErrors[field.id] = `${field.label} is required`
          continue
        }

        // Specific validation for email
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            newErrors[field.id] = 'Please enter a valid email address'
          }
        }

        // Length validation
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`
        }

        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.id] = `${field.label} must not exceed ${field.validation.maxLength} characters`
        }

        // Number validation
        if (field.type === 'number') {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            newErrors[field.id] = `${field.label} must be a valid number`
          } else {
            if (field.validation?.min !== undefined && numValue < field.validation.min) {
              newErrors[field.id] = `${field.label} must be at least ${field.validation.min}`
            }
            if (field.validation?.max !== undefined && numValue > field.validation.max) {
              newErrors[field.id] = `${field.label} must not exceed ${field.validation.max}`
            }
          }
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/webinars/${webinarId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: formData.name,
          userEmail: formData.email,
          mobileNumber: formData.phone || null,
          formResponses: formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setRegistrationResult(result.registration)
        setSubmitted(true)
      } else {
        setErrors({ general: result.error || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    const commonProps = {
      id: field.id,
      placeholder: field.placeholder,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.id, e.target.value),
      className: error ? 'border-red-500' : '',
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return <Input {...commonProps} type={field.type === 'phone' ? 'tel' : field.type} />

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        )

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={3}
            maxLength={field.validation?.maxLength}
          />
        )

      case 'select':
        return (
          <Select {...commonProps}>
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
                  checked={value === option}
                  onChange={() => handleInputChange(field.id, option)}
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
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleInputChange(field.id, [...currentValue, option])
                    } else {
                      handleInputChange(field.id, currentValue.filter((v: string) => v !== option))
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return <Input {...commonProps} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading registration form...</p>
        </div>
      </div>
    )
  }

  if (!webinar || !registrationForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Registration Not Available</h2>
          <p className="text-gray-600">This webinar is not accepting registrations.</p>
        </div>
      </div>
    )
  }

  if (submitted && registrationResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardBody className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-success-100 to-success-200 flex items-center justify-center mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">{registrationResult.message}</p>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">Registration ID</p>
              <p className="font-mono text-sm text-gray-900">{registrationResult.id}</p>
            </div>
            {registrationResult.status === 'approved' && (
              <p className="text-sm text-green-600">
                You'll receive a confirmation email with joining instructions shortly.
              </p>
            )}
            {registrationResult.status === 'pending' && (
              <p className="text-sm text-yellow-600">
                Your registration is pending approval. You'll be notified once approved.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    )
  }

  const formSchema = registrationForm.formSchema as { fields: FormField[] }
  const sortedFields = formSchema.fields.sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Webinar Info */}
        <Card className="mb-8">
          <CardBody>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{webinar.title}</h1>
            {webinar.description && (
              <p className="text-gray-700 mb-4">{webinar.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(webinar.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {new Date(webinar.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  ({webinar.duration} mins)
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Register for Webinar</h2>
            </div>
          </CardHeader>
          <CardBody>
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {sortedFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="flex items-center space-x-1">
                    <span>{field.label}</span>
                    {field.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </Label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-red-600 text-sm">{errors[field.id]}</p>
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? 'Registering...' : 'Register for Webinar'}
                </Button>
              </div>
            </form>

            <div className="mt-4 text-xs text-gray-500">
              <p>Required fields are marked with an asterisk (*)</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}