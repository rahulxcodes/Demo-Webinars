'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Cog6ToothIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  PencilIcon,
  PlayIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  LinkIcon,
  QrCodeIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { FormBuilder } from '@/components/FormBuilder/FormBuilder'
import { RegistrationFormBuilder } from '@/components/FormBuilder/RegistrationFormBuilder'
import { Webinar } from '@/lib/types'
import { RegistrationFormConfig, FormSchema } from '@/lib/types/registration'

type TabType = 'overview' | 'settings' | 'registration' | 'advanced' | 'analytics'

export default function WebinarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const webinarId = params.id as string
  
  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [registrationForm, setRegistrationForm] = useState<RegistrationFormConfig | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
  })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [startingWebinar, setStartingWebinar] = useState(false)

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
        // Initialize edit form with current data
        setEditForm({
          title: data.webinar.title,
          description: data.webinar.description || '',
          startTime: new Date(data.webinar.startTime).toISOString().slice(0, 16),
          duration: data.webinar.duration,
        })
        setRegistrationForm(data.webinar.registrationForm)
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

  const handleEditFormChange = useCallback((field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }, [])

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) return

    setSaving(true)
    try {
      const response = await fetch(`/api/webinars/${webinarId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          startTime: editForm.startTime,
          duration: editForm.duration,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setWebinar(data.webinar)
        setHasUnsavedChanges(false)
        setIsEditing(false)
        // Show success message
      }
    } catch (error) {
      console.error('Error updating webinar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (webinar) {
      setEditForm({
        title: webinar.title,
        description: webinar.description || '',
        startTime: new Date(webinar.startTime).toISOString().slice(0, 16),
        duration: webinar.duration,
      })
    }
    setHasUnsavedChanges(false)
    setIsEditing(false)
  }

  const handleDeleteWebinar = async () => {
    if (!confirm('Are you sure you want to delete this webinar? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/webinars/${webinarId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting webinar:', error)
    }
  }

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/register/${webinarId}`
    navigator.clipboard.writeText(link)
    // Show success message
  }

  const handleStartWebinar = useCallback(async () => {
    if (!webinar) return

    console.log('Starting webinar:', webinar.id, 'with Stream Call ID:', webinar.streamCallId)
    setStartingWebinar(true)

    try {
      const response = await fetch(`/api/webinars/${webinarId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log('Start webinar response:', result)

      if (response.ok) {
        // Update local state
        setWebinar(prev => prev ? { ...prev, status: 'live', streamStatus: 'live' } : null)
        
        // Show success feedback
        alert('Webinar started successfully! Participants can now join.')
        
        // Redirect to host interface using webinar ID, not streamCallId
        router.push(`/webinar/${webinar.id}/host`)
      } else {
        console.error('Failed to start webinar:', result.error)
        alert(`Failed to start webinar: ${result.error}`)
      }
    } catch (error) {
      console.error('Error starting webinar:', error)
      alert('Failed to start webinar. Please try again.')
    } finally {
      setStartingWebinar(false)
    }
  }, [webinar, webinarId, router])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Cog6ToothIcon },
    { id: 'settings', label: 'Settings', icon: PencilIcon },
    { id: 'registration', label: 'Registration', icon: ClipboardDocumentListIcon },
    { id: 'advanced', label: 'Advanced', icon: UserGroupIcon },
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
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-1 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <span>/</span>
          <span>Webinars</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{webinar.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{webinar.title}</h1>
            <p className="text-gray-600 mt-2">
              {new Date(webinar.startTime).toLocaleDateString()} at{' '}
              {new Date(webinar.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {webinar.status}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2">
                <Button onClick={handleSaveChanges} disabled={saving}>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleStartWebinar}
              disabled={startingWebinar || webinar.status === 'live'}
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              {startingWebinar ? 'Starting...' : webinar.status === 'live' ? 'Live' : 'Start Webinar'}
            </Button>
            <Button variant="outline" size="sm">
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteWebinar}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-xl font-semibold">Webinar Overview</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('settings')}
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <p className="text-gray-900 font-medium">{webinar.title}</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <p className="text-gray-900 capitalize">{webinar.status}</p>
                    </div>
                    <div>
                      <Label>Registrations</Label>
                      <p className="text-gray-900">
                        {webinar.registrations?.length || 0} registered
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  <Button className="w-full">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start Webinar
                  </Button>
                  <Button variant="outline" className="w-full">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                  <Button variant="outline" className="w-full">
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Registration Link</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register/${webinarId}`}
                      className="text-sm"
                      readOnly
                    />
                    <Button variant="outline" size="sm" onClick={copyRegistrationLink}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    <QrCodeIcon className="h-4 w-4 mr-2" />
                    Show QR Code
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Edit Webinar Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <Label htmlFor="title">Webinar Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => handleEditFormChange('title', e.target.value)}
                  placeholder="Enter webinar title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Enter webinar description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Date & Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => handleEditFormChange('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <select
                    id="duration"
                    value={editForm.duration.toString()}
                    onChange={(e) => handleEditFormChange('duration', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={saving || !hasUnsavedChanges}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
            <RegistrationFormBuilder
              webinarId={webinarId}
              initialFormSchema={registrationForm?.formSchema}
              onSave={(formData) => {
                // Refresh webinar data after save
                fetchWebinar()
              }}
            />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Advanced Features</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Interactive Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Chat</Label>
                        <p className="text-sm text-gray-600">Allow participants to chat during the webinar</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Q&A</Label>
                        <p className="text-sm text-gray-600">Allow participants to ask questions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Polls</Label>
                        <p className="text-sm text-gray-600">Create interactive polls during webinar</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Raise Hand</Label>
                        <p className="text-sm text-gray-600">Allow participants to raise hands</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Recording Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Recording Mode</Label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="auto">Auto-Record</option>
                        <option value="manual">Manual Recording</option>
                        <option value="off">No Recording</option>
                      </select>
                    </div>
                    <div>
                      <Label>Recording Quality</Label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="hd">HD (1080p)</option>
                        <option value="sd">SD (720p)</option>
                        <option value="low">Low (480p)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Pre-recorded Content</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <PlayIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-gray-600">Upload pre-recorded video content</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button>Save Advanced Settings</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {webinar.registrations?.filter(r => r.status === 'approved').length || 0}
                  </div>
                  <p className="text-gray-600 text-sm">Approved Registrations</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-warning-600">
                    {webinar.registrations?.filter(r => r.status === 'pending').length || 0}
                  </div>
                  <p className="text-gray-600 text-sm">Pending Approval</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="text-center">
                  <div className="text-3xl font-bold text-gray-600">0</div>
                  <p className="text-gray-600 text-sm">Attendance Rate</p>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Registration Timeline</h2>
              </CardHeader>
              <CardBody>
                {webinar.registrations && webinar.registrations.length > 0 ? (
                  <div className="space-y-3">
                    {webinar.registrations.slice(0, 5).map((registration, index) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Registration #{index + 1}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(registration.registeredAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          registration.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">No registration data yet</p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Engagement Metrics</h2>
              </CardHeader>
              <CardBody>
                <div className="text-center py-8 text-gray-500">
                  <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Engagement data will appear after the webinar starts</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}