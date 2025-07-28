'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Cog6ToothIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import { FormBuilder } from '@/components/FormBuilder/FormBuilder'
import { Webinar } from '@/lib/types'
import { RegistrationFormConfig, FormSchema } from '@/lib/types/registration'

type TabType = 'overview' | 'registration' | 'attendees' | 'analytics'

export default function WebinarDetailsPage() {
  const params = useParams()
  const webinarId = params.id as string
  
  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormConfig | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWebinar()
    fetchRegistrationForm()
  }, [webinarId])

  const fetchWebinar = async () => {
    try {
      const response = await fetch(`/api/webinars/${webinarId}`)
      if (response.ok) {
        const data = await response.json()
        setWebinar(data.webinar)
      }
    } catch (error) {
      console.error('Error fetching webinar:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrationForm = async () => {
    try {
      const response = await fetch(`/api/webinars/${webinarId}/registration`)
      if (response.ok) {
        const data = await response.json()
        setRegistrationForm(data.registrationForm)
      }
    } catch (error) {
      console.error('Error fetching registration form:', error)
    }
  }

  const saveRegistrationForm = async (formSchema: FormSchema) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/webinars/${webinarId}/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requireRegistration: registrationForm?.requireRegistration ?? true,
          autoApprove: registrationForm?.autoApprove ?? true,
          maxAttendees: registrationForm?.maxAttendees,
          registrationDeadline: registrationForm?.registrationDeadline,
          formSchema,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRegistrationForm(data.registrationForm)
        // Show success message
      }
    } catch (error) {
      console.error('Error saving registration form:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateRegistrationSettings = async (updates: Partial<RegistrationFormConfig>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/webinars/${webinarId}/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationForm,
          ...updates,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRegistrationForm(data.registrationForm)
      }
    } catch (error) {
      console.error('Error updating registration settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Cog6ToothIcon },
    { id: 'registration', label: 'Registration', icon: ClipboardDocumentListIcon },
    { id: 'attendees', label: 'Attendees', icon: UserGroupIcon },
    { id: 'analytics', label: 'Analytics', icon: PresentationChartLineIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading webinar details...</p>
        </div>
      </div>
    )
  }

  if (!webinar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Webinar not found</h2>
          <p className="text-gray-600">The webinar you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{webinar.title}</h1>
          <p className="text-gray-600 mt-2">
            {new Date(webinar.startTime).toLocaleDateString()} at{' '}
            {new Date(webinar.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Webinar Overview</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="text-gray-900">{webinar.title}</p>
              </div>
              {webinar.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-gray-700">{webinar.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <p className="text-gray-900">
                    {new Date(webinar.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Duration</Label>
                  <p className="text-gray-900">{webinar.duration} minutes</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'registration' && (
          <div className="space-y-6">
            {/* Registration Settings */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Registration Settings</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Registration</Label>
                    <p className="text-sm text-gray-600">Attendees must register before joining</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={registrationForm?.requireRegistration ?? true}
                      onChange={(e) => updateRegistrationSettings({ requireRegistration: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {registrationForm?.requireRegistration && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-approve Registrations</Label>
                        <p className="text-sm text-gray-600">Automatically approve new registrations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={registrationForm?.autoApprove ?? true}
                          onChange={(e) => updateRegistrationSettings({ autoApprove: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="max-attendees">Maximum Attendees</Label>
                        <Input
                          id="max-attendees"
                          type="number"
                          value={registrationForm?.maxAttendees || ''}
                          onChange={(e) => updateRegistrationSettings({ maxAttendees: parseInt(e.target.value) || undefined })}
                          placeholder="No limit"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="registration-deadline">Registration Deadline (hours before)</Label>
                        <Input
                          id="registration-deadline"
                          type="number"
                          value={registrationForm?.registrationDeadline || ''}
                          onChange={(e) => updateRegistrationSettings({ registrationDeadline: parseInt(e.target.value) || undefined })}
                          placeholder="No deadline"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>

            {/* Form Builder */}
            {registrationForm?.requireRegistration && (
              <FormBuilder
                initialSchema={registrationForm.formSchema as FormSchema}
                onSave={saveRegistrationForm}
                loading={saving}
              />
            )}
          </div>
        )}

        {activeTab === 'attendees' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Attendee Management</h2>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8 text-gray-500">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Attendee management coming soon</p>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Registration Analytics</h2>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8 text-gray-500">
                <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Analytics dashboard coming soon</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}