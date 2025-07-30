# Next.js 14 Webinar Platform

## Overview

This is a professional educational webinar platform built with Next.js 14 App Router, TypeScript, and Tailwind CSS. The platform is designed to integrate with Stream.io for real-time video communication and Prisma with PostgreSQL for data persistence. This foundation provides the core structure for building comprehensive webinar functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 30, 2025 - FIXED APPLICATION STARTUP ISSUE AND VERIFIED NEXT.JS FUNCTIONALITY
- ✅ **NEXT.JS STARTUP FIXED**: Application now runs correctly on port 5000 with native Next.js dev server
- ✅ **DEPRECATED BRIDGE REMOVED**: Fixed server/index.ts causing workflow failures by running Next.js directly
- ✅ **NEXT.CONFIG.JS OPTIMIZED**: Removed deprecated allowedDevOrigins warning for Next.js 15.4.4 compatibility
- ✅ **APPLICATION VERIFIED**: All functionality working correctly - homepage, API routes, authentication system
- ✅ **READY FOR GITHUB CLEANUP**: Project structure perfect, just needs git cleanup commands to remove 3GB of tracked build files

### January 29, 2025 - DEPLOYMENT CONFIGURATION FIXED FOR NEXT.JS NATIVE DEPLOYMENT
- ✅ **DEPLOYMENT TYPE MIGRATION**: Changed from Vite Static deployment to Next.js Autoscale deployment
- ✅ **NEXT.JS CONFIG UPDATED**: Added standalone output and port 5000 configuration for Replit
- ✅ **SERVER BRIDGE DEPRECATED**: Marked server/index.ts bridge script as deprecated for native Next.js deployment
- ✅ **BUILD COMMANDS UPDATED**: Changed build process from Vite to Next.js native build system
- ✅ **PRODUCTION OPTIMIZATIONS**: Added compression, powered-by header removal, and standalone output
- ✅ **PORT CONFIGURATION**: Configured Next.js to run on port 5000 for Replit compatibility
- ✅ **DEPLOYMENT READY**: Application now ready for Autoscale deployment with proper Next.js configuration

### January 29, 2025 - PLATFORM-WIDE TEXT VISIBILITY IMPROVEMENTS COMPLETED
- ✅ **COMPREHENSIVE TEXT READABILITY ENHANCEMENT**: Systematically improved text contrast across entire platform
- ✅ **WEBINAR CARD METADATA FIXED**: Changed webinar dates, durations, and descriptions from light gray (text-gray-500) to darker gray (text-gray-700)
- ✅ **DASHBOARD VISIBILITY IMPROVED**: Enhanced webinar counts, empty states, and navigation text with better contrast
- ✅ **HEADER NAVIGATION ENHANCED**: Updated navigation links, user display, and tab visibility with darker text colors
- ✅ **REGISTRATION PAGES UPGRADED**: Improved webinar information, form labels, and metadata visibility
- ✅ **AUTH PAGES OPTIMIZED**: Enhanced signin/signup page text contrast and form helper text readability
- ✅ **DEBUG PAGE CLARITY**: Updated troubleshooting information and system status text for better visibility
- ✅ **FORM COMPONENTS UPDATED**: Enhanced input helper text and form builder empty states with darker colors
- ✅ **WEBINAR DETAIL PAGES**: Improved breadcrumb navigation, analytics text, and status information visibility
- ✅ **PROTECTED STREAM UI**: Maintained existing live class UI design as requested - no changes to video interface
- ✅ **CSS STRUCTURE CLEANED**: Fixed compilation errors and maintained clean styling architecture

### January 28, 2025 - COMPREHENSIVE WEBINAR RECORDING SYSTEM IMPLEMENTED
- ✅ **FIXED isRecordingActive UNDEFINED ERROR**: Added proper useIsCallRecordingInProgress hook to LiveWebinarLayout component
- ✅ **FIXED handleToggleRecording UNDEFINED ERROR**: Implemented missing recording toggle function with proper error handling
- ✅ **DATABASE SCHEMA UPDATED**: Added autoRecord, recordingQuality, allowHostRecordingControl fields to Webinar model
- ✅ **WEBINAR CREATION FORM ENHANCED**: Added recording settings section with auto-record, quality, and control options
- ✅ **API ROUTES UPDATED**: Modified webinar creation API to handle new recording configuration fields
- ✅ **STREAM SDK RECORDING INTEGRATION**: Implemented auto-recording on webinar start with configurable settings
- ✅ **HOST RECORDING CONTROLS**: Added safe live recording start/stop controls that don't disrupt webinars
- ✅ **RECORDING STATUS INDICATORS**: Added visual recording status with pulsing red dot in webinar header
- ✅ **COMPREHENSIVE ERROR HANDLING**: Recording failures don't break webinar experience with graceful fallbacks
- ✅ **CUSTOMCONTROLBAR INTEGRATION**: Enhanced control bar with recording button and proper prop handling

### January 28, 2025 - STREAM VIDEO SDK INTEGRATION FULLY WORKING
- ✅ **COMPLETE STREAM VIDEO SDK DEBUG & FIX**: Fixed all "Start Webinar" button integration issues
- ✅ **ROOT CAUSE IDENTIFIED**: Missing frontend click handler + Stream SDK call type configuration
- ✅ **FRONTEND INTEGRATION FIXED**: Added proper handleStartWebinar function with loading states
- ✅ **STREAM SDK CALL TYPE CORRECTED**: Changed from 'default' to 'livestream' call type for proper go-live functionality
- ✅ **COMPREHENSIVE DEBUG SYSTEM**: Created /api/debug/stream-test endpoint showing all tests passing
- ✅ **AUTHENTICATION SYSTEM INTEGRATION**: Fixed foreign key constraint violations with proper session management
- ✅ **HOST VIDEO INTERFACE CREATED**: Built complete React-based host interface with Stream React SDK
- ✅ **STREAM TOKEN API**: Created /api/stream-token/[callId] endpoint for client-side authentication
- ✅ **AUTOMATIC REDIRECT**: "Start Webinar" button now redirects to host interface after going live
- ✅ **NEXT.JS 15 ASYNC PARAMS MIGRATION**: Fixed all async params warnings by updating client components to use `React.use(params)` and API routes to use `await params`
- ✅ **REACT HOOKS ORDER VIOLATION FIX**: Fixed DashboardPage hooks order issue by moving all hooks to top level before conditional rendering
- ✅ **STREAM UI ENHANCEMENTS & DUPLICATE PARTICIPANT FIX**: Enhanced host interface with professional design and resolved Stream client creation issues
  * Fixed duplicate participants issue using `StreamVideoClient.getOrCreateInstance()` instead of `new StreamVideoClient()`
  * Added proper component cleanup with `disconnectUser()` on unmount
  * Enhanced host interface with live indicators, call duration timer, participant count, connection status badges
  * Improved video layout with gradient backgrounds, backdrop blur effects, glassmorphism styling
  * Added empty state overlay for when waiting for participants
  * Created floating participants panel with better visual hierarchy
  * Fixed ParticipantView component import/export error by removing invalid `ParticipantViewUISpotlight` prop
- ✅ **WEBINAR ROUTING BUG FIX**: Resolved critical "Webinar not found" error in host interface
  * **Root Cause**: URL routing mismatch between `webinar.id` and `streamCallId` 
  * **Problem**: Host page was using `streamCallId` in URLs but API expected `webinar.id`
  * **Solution**: Fixed dashboard redirect to use `webinar.id` instead of `streamCallId`
  * **Enhanced Debugging**: Added comprehensive logging for webinar initialization process
  * **Stream Integration**: Updated Stream client to properly use `streamCallId` for video calls while using `webinar.id` for database operations
- ✅ **COMPLETE PROJECT TRANSFORMATION**: Converted from Vite+React to Next.js 14 foundation
- ✓ Installed Next.js 14 with App Router and TypeScript
- ✓ Created basic Next.js project structure with app directory
- ✓ Set up Tailwind CSS with Next.js configuration
- ✓ Implemented basic homepage with "Welcome to Webinar Platform"
- ✓ Created dashboard page with "New Webinar" button and placeholder table
- ✓ Added Prisma schema with User and Webinar models
- ✓ Configured NextAuth for authentication foundation
- ✓ Created basic UI components (Button) with Tailwind styling
- ✓ Set up environment configuration with DATABASE_URL, NEXTAUTH_SECRET, STREAM_API_KEY
- ✓ Configured TypeScript with Next.js optimized settings
- ✓ Removed legacy Express server and Vite configuration
- ✓ Updated project to run on Next.js dev server (port 5000 for Replit compatibility)
- ✓ Created proper file structure: /app, /components/ui, /lib, /prisma
- ✓ **WEBINAR CREATION SYSTEM**: Added complete webinar creation form functionality
- ✓ Installed react-hook-form, @hookform/resolvers, date-fns, and zod for form management
- ✓ Created comprehensive UI components: Input, Textarea, Select, Label, Navbar
- ✓ Implemented /dashboard/new-webinar page with full form validation
- ✓ Added professional navigation bar with responsive design
- ✓ Enhanced homepage with improved styling and call-to-action buttons
- ✓ Updated dashboard with better UX and navigation between pages
- ✓ Implemented form validation with Zod schema and error handling
- ✓ Added success notifications and loading states for form submission
- ✓ Created mobile-responsive design with Tailwind CSS utilities
- ✓ **PROFESSIONAL UI DESIGN TRANSFORMATION**: Complete modern SaaS-style redesign
- ✓ Installed @headlessui/react, @heroicons/react, clsx for modern UI components
- ✓ Created professional color scheme with primary, success, warning, error palettes
- ✓ Built modern Header component with responsive navigation and glassmorphism effects
- ✓ Redesigned homepage with gradient hero section, feature cards, and call-to-action
- ✓ Enhanced dashboard with stats cards, search functionality, and empty states
- ✓ Modernized webinar creation form with progress indicators and feature previews
- ✓ Added comprehensive UI component library: Card, enhanced Button, Input, Select, Label
- ✓ Implemented smooth animations, micro-interactions, and hover effects
- ✓ Created consistent design system with shadows, gradients, and typography scale
- ✓ Added professional loading states, error handling, and success animations
- ✓ **COMPREHENSIVE REGISTRATION SYSTEM**: Complete webinar registration functionality
- ✓ Created dynamic form builder with drag-and-drop field ordering and live preview
- ✓ Added 7 field types: text, textarea, select, checkbox, radio, number, phone/email
- ✓ Implemented registration form configuration with capacity and deadline controls
- ✓ Built public registration pages with validation and mobile-responsive design
- ✓ Added registration management dashboard with approval workflow
- ✓ Created REST API endpoints for registration form management
- ✓ Extended database schema with RegistrationForm and Registration models
- ✓ Implemented anti-spam protection with duplicate registration prevention
- ✓ Added registration status tracking (pending, approved, rejected) 
- ✓ Created comprehensive form validation with custom error messages
- ✓ **ENHANCED WEBINAR DETAIL PAGE**: Complete webinar management interface
- ✓ Built comprehensive tabbed interface (Overview, Settings, Registration, Advanced, Analytics)
- ✓ Added full editing capabilities with real-time form validation and unsaved changes tracking
- ✓ Implemented breadcrumb navigation and professional action buttons
- ✓ Created registration link sharing with copy functionality and QR code options
- ✓ Added advanced webinar features configuration (chat, Q&A, polls, recording settings)
- ✓ Built analytics dashboard with registration metrics and timeline visualization
- ✓ Extended API with PATCH/DELETE endpoints for webinar management
- ✓ Added professional quick actions sidebar with start webinar and duplicate options
- ✓ **COMPREHENSIVE REGISTRATION FORM BUILDER**: Complete dynamic form creation system
- ✓ Created drag-and-drop form builder with live preview and 8+ field types
- ✓ Added registration settings panel with capacity, deadlines, and approval workflows
- ✓ Built API endpoint for saving form configurations with proper database integration
- ✓ Implemented field options management for dropdowns, radio buttons, and checkboxes
- ✓ **CRITICAL DESIGN STABILITY SOLUTION**: Permanent fix for recurring header navigation issues
- ✓ Created robust Header component with proper imports and styling definitions
- ✓ Added comprehensive primary color system with CSS variables for consistent theming
- ✓ Fixed layout.tsx import paths and ensured header renders properly across all pages
- ✓ Implemented comprehensive Tailwind color utilities to prevent styling disruption
- ✓ **COMPLETE STREAM VIDEO SDK INTEGRATION**: Pre-scheduled call system with professional live streaming
- ✓ Updated database schema with slug, streamCallId, streamStatus, maxAttendees fields
- ✓ Implemented pre-scheduled call creation - Stream calls created when webinar is created
- ✓ Built comprehensive webinar creation API with Stream call integration
- ✓ Created /api/webinars/[id]/start endpoint for activating live streams
- ✓ Enhanced Stream token API with proper call ID mapping and role validation
- ✓ Updated host interface to use pre-scheduled calls and start webinar functionality
- ✓ Created join token validation API at /api/join/validate/[token]
- ✓ Fixed BasicWebinar component to use 'default' call type for maximum compatibility
- ✓ Implemented proper JWT token generation with Stream.io authentication
- ✓ Added comprehensive error handling and status management for live streams
- ✓ **FIXED START WEBINAR BUTTON FUNCTIONALITY**: Resolved Stream permissions and role issues
- ✓ Fixed Stream client role permissions (admin role for call management)
- ✓ Corrected JWT token timing issues with proper iat handling
- ✓ Enhanced host interface with loading states and success feedback
- ✓ Start Webinar button now successfully activates live streaming with status updates
- ✓ **COMPLETE AUTHENTICATION SYSTEM**: Full user management with NextAuth.js integration
- ✓ Installed NextAuth.js, Prisma adapter, and bcryptjs for secure authentication
- ✓ Updated database schema with NextAuth tables (Account, Session, VerificationToken)
- ✓ Enhanced User model with authentication fields, roles, and proper relations
- ✓ Created comprehensive role system (ADMIN, HOST, CO_HOST, PANELIST, ATTENDEE)
- ✓ Built professional login and signup pages with form validation
- ✓ Implemented JWT-based sessions with role-based access control
- ✓ Added Google OAuth support for social authentication
- ✓ Created middleware for route protection (dashboard, host interfaces)
- ✓ Updated Header component with authentication state and user management
- ✓ Enhanced homepage with session-aware navigation and call-to-action buttons
- ✓ Built user profile page with account management and role-specific features
- ✓ Integrated authentication with existing webinar and registration systems

## System Architecture

### Framework Architecture
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with custom utility classes
- **Development**: Next.js dev server on port 3000
- **Build System**: Next.js optimized bundling and compilation

### Frontend Structure
- **App Directory**: Modern Next.js App Router pattern
- **Components**: Modular UI components in `/components/ui`
- **Utilities**: Shared utility functions in `/lib`
- **Pages**: File-based routing with app directory structure

### Database Strategy
- **ORM**: Prisma ORM for type-safe database operations
- **Connection**: PostgreSQL via DATABASE_URL environment variable
- **Schema Location**: Prisma schema in `/prisma/schema.prisma`
- **Models**: User and Webinar models with proper types and relations

### Authentication System
- **Auth System**: NextAuth.js with Prisma adapter for full user management
- **Session Strategy**: JWT-based sessions with role-based access control
- **Providers**: Email/password authentication + Google OAuth support
- **API Routes**: 
  - `/app/api/auth/[...nextauth]` - NextAuth configuration and handlers
  - `/app/api/auth/signup` - User registration endpoint
- **Protection**: Middleware-based route protection for dashboard and host interfaces
- **User Roles**: ADMIN, HOST, CO_HOST, PANELIST, ATTENDEE with proper permissions
- **Pages**: Professional login/signup pages with form validation

## Key Components

### Video Communication
- **Stream.io Integration**: 
  - Server SDK for token generation and call management
  - Client SDK for video call interface
  - Real-time video/audio streaming capabilities
- **Call Features**:
  - Video on/off toggle
  - Microphone mute/unmute
  - Screen sharing
  - Settings modal for device selection
  - Call duration tracking

### User Interface Components
- **Pre-call Screen**: Name input and call ID management
- **Video Call Screen**: Main call interface with participant tiles
- **Call Controls**: Bottom control bar with media toggles
- **Participant Management**: Dynamic participant grid layout
- **Settings Modal**: Device selection and preferences

### Shared Schemas
- Token request/response validation using Zod
- Type-safe API contracts between frontend and backend
- Call joining validation schemas

## Data Flow

### Authentication Flow
1. User enters name and call ID
2. Frontend generates unique user ID
3. Backend validates request and generates Stream token
4. Stream client initializes with token and user data
5. User joins video call

### Call Management Flow
1. Call creation/joining through Stream API
2. Real-time participant updates
3. Media device state management
4. Call controls and settings synchronization

### API Endpoints
- `GET /token?userId=<userId>` - Generate Stream authentication token (port 3001)
- `POST /join-call` - Join/create call and register user in database (port 3001)
- `GET /calls` - Get list of active calls (port 3001)
- `GET /health` - Server health check endpoint (port 3001)
- Legacy endpoints on port 5000 maintained for development

## External Dependencies

### Core Video Infrastructure
- **Stream.io**: Real-time video calling platform
  - Node SDK for server-side operations
  - React SDK for client-side video interface
  - Token-based authentication system

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

### Development Tools
- **Replit Integration**: Development environment plugins
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- tsx for TypeScript execution in development
- Integrated error overlay for debugging
- Replit-specific development banner and cartographer

### Production Build
- Frontend built to `/dist/public` directory
- Backend bundled with esbuild to `/dist/index.js`
- Static file serving integrated with Express
- Environment variable configuration for Stream.io credentials

### Environment Configuration
- `STREAM_API_KEY` and `STREAM_API_SECRET` for Stream.io
- `DATABASE_URL` for PostgreSQL connection
- `NODE_ENV` for environment detection
- Development vs production asset serving

### Session Management
- In-memory storage implementation for development
- PostgreSQL session store ready for production
- User data persistence through storage interface

The application is designed to be easily deployable on Replit with minimal configuration, while maintaining the flexibility to scale to production environments with proper database and session management.