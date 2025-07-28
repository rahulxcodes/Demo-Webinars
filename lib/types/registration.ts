export interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'email' | 'phone'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // for select, checkbox, radio
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
  order: number
}

export interface FormSchema {
  fields: FormField[]
  version: number
}

export interface RegistrationFormConfig {
  id: string
  webinarId: string
  requireRegistration: boolean
  autoApprove: boolean
  maxAttendees?: number
  registrationDeadline?: number
  formSchema: FormSchema
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: string
  webinarId: string
  formId: string
  userEmail: string
  userName: string
  mobileNumber?: string
  formResponses: Record<string, any>
  status: 'pending' | 'approved' | 'rejected'
  joinToken: string
  sourceData?: Record<string, any>
  registeredAt: string
  approvedAt?: string
}

export interface RegistrationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  conversionRate: number
}