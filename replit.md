# Video Calling Application

## Overview

This is a modern video calling application built with React frontend and Express backend, utilizing Stream.io for real-time video communication. The application features a clean, responsive interface with support for video calls, screen sharing, and device controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **UI Theme**: New York style with neutral base color and CSS variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for production bundling

### Database Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Stored in `/migrations` directory

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
- `POST /api/token` - Generate Stream authentication token
- `POST /api/call` - Create or join video call (partial implementation)

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