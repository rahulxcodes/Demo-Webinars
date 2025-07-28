'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const webinarSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().min(1, 'Duration is required'),
})

type WebinarFormData = z.infer<typeof webinarSchema>

export default function NewWebinarPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WebinarFormData>({
    resolver: zodResolver(webinarSchema),
    defaultValues: {
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '10:00',
      duration: '60',
    },
  })

  const onSubmit = async (data: WebinarFormData) => {
    try {
      console.log('Webinar Form Data:', data)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
      reset()
      
      // Hide success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000)
    } catch (error) {
      console.error('Error creating webinar:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Webinar
          </h1>
          <p className="text-gray-600">
            Fill in the details for your upcoming webinar
          </p>
        </div>

        {isSubmitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Webinar created successfully!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter webinar title"
                className={errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what your webinar will cover (optional)"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className={errors.date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  {...register('time')}
                  className={errors.time ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration <span className="text-red-500">*</span>
              </Label>
              <Select
                id="duration"
                {...register('duration')}
                className={errors.duration ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </Select>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Webinar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}