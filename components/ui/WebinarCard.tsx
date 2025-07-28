import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { formatWebinarStatus } from '@/lib/utils/webinar-status'
import { Webinar } from '@/lib/types'

interface WebinarCardProps {
  webinar: Webinar
  onDelete: (id: string) => void
}

// Memoized component for better performance
export const WebinarCard = React.memo(({ webinar, onDelete }: WebinarCardProps) => {
  const statusInfo = formatWebinarStatus(webinar.status)
  const startDate = new Date(webinar.startTime)
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-gray-900">{webinar.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        {webinar.description && (
          <p className="text-gray-600 mt-1">{webinar.description}</p>
        )}
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          <ClockIcon className="h-4 w-4 ml-4 mr-1" />
          {webinar.duration} minutes
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <DocumentDuplicateIcon className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(webinar.id)}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

WebinarCard.displayName = 'WebinarCard'