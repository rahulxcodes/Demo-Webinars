'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { CheckCircleIcon, ClockIcon, CalendarIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const webinarSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
  autoRecord: z.boolean().default(true),
  recordingQuality: z.string().default('720p'),
  allowHostRecordingControl: z.boolean().default(true),
})

type WebinarFormData = z.infer<typeof webinarSchema>

export default function NewWebinarPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WebinarFormData>({
    resolver: zodResolver(webinarSchema),
    defaultValues: {
      autoRecord: true,
      recordingQuality: '720p',
      allowHostRecordingControl: true,
    },
  })

  const onSubmit = async (data: WebinarFormData) => {
    setIsSubmitting(true)
    
    try {
      // Combine date and time into ISO string
      const startTime = new Date(`${data.date}T${data.time}`).toISOString()
      
      const webinarData = {
        title: data.title,
        description: data.description,
        startTime,
        duration: parseInt(data.duration),
        autoRecord: data.autoRecord,
        recordingQuality: data.recordingQuality,
        allowHostRecordingControl: data.allowHostRecordingControl,
      }
      
      console.log('Creating webinar:', webinarData)
      
      const response = await fetch('/api/webinars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webinarData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create webinar')
      }
      
      const result = await response.json()
      console.log('Webinar created:', result)
      
      setSubmitSuccess(true)
      
      // Reset form and redirect after successful submission
      setTimeout(() => {
        reset()
        setSubmitSuccess(false)
        router.push('/dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error creating webinar:', error)
      // You could add an error state here to show to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardBody className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-success-100 to-success-200 flex items-center justify-center mb-6">
              <CheckCircleIcon className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Webinar Created!</h2>
            <p className="text-gray-600 mb-4">Your webinar has been successfully created and is ready to go.</p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to dashboard...
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Webinar
          </h1>
          <p className="text-lg text-gray-600">
            Set up your webinar with just a few details
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Basic Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex items-center opacity-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Settings (Coming Soon)</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Webinar Information</h2>
            <p className="text-sm text-gray-600">Fill in the basic details for your webinar</p>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" required>
                  Webinar Title
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Introduction to React Development"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" required>
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe what attendees will learn and what topics you'll cover..."
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message || "Help attendees understand what they'll gain from your webinar"}
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date" required>
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                    leftIcon={<CalendarIcon className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <Label htmlFor="time" required>
                    Start Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    {...register('time')}
                    error={!!errors.time}
                    helperText={errors.time?.message}
                    leftIcon={<ClockIcon className="h-4 w-4" />}
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration" required>
                  Duration
                </Label>
                <Select
                  id="duration"
                  {...register('duration')}
                  error={!!errors.duration}
                  helperText={errors.duration?.message || "Choose the expected length of your webinar"}
                >
                  <option value="">Select duration</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </Select>
              </div>

              {/* Recording Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recording Settings</h3>
                
                <div className="space-y-4">
                  {/* Auto Record */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        {...register('autoRecord')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Auto-record webinar</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Recording will start automatically when webinar begins
                    </p>
                  </div>

                  {/* Recording Quality */}
                  <div>
                    <Label htmlFor="recordingQuality">
                      Recording Quality
                    </Label>
                    <Select id="recordingQuality" {...register('recordingQuality')}>
                      <option value="480p">480p (Standard)</option>
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (Full HD)</option>
                    </Select>
                  </div>

                  {/* Host Recording Control */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        {...register('allowHostRecordingControl')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Allow host to control recording during webinar</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Host can start/stop recording manually during the webinar
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <h3 className="text-sm font-semibold text-primary-900 mb-3 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  What you get with your webinar:
                </h3>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
                    HD video and crystal clear audio
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
                    Screen sharing and presentation tools
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
                    Interactive chat and Q&A features
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-primary-600" />
                    Automatic recording and playback
                  </li>
                </ul>
              </div>
            </CardBody>

            <CardFooter>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full sm:w-auto min-w-[140px]"
                >
                  {isSubmitting ? 'Creating Webinar...' : 'Create Webinar'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}