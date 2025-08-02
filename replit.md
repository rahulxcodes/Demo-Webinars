# Next.js 14 Webinar Platform

## Overview
This project is a professional educational webinar platform built with Next.js 14 App Router, TypeScript, and Tailwind CSS. It integrates with Stream.io for real-time video communication and Prisma with PostgreSQL for data persistence. The platform aims to provide a robust and comprehensive solution for hosting and managing webinars, with features like webinar scheduling, registration management, live streaming, and recording capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Framework and Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS for utility-first styling
- **ORM**: Prisma for type-safe database operations
- **Authentication**: NextAuth.js with Prisma adapter

### Frontend Architecture
- **Structure**: Modern Next.js App Router pattern with `app` directory.
- **Components**: Modular UI components located in `/components/ui`.
- **Utilities**: Shared functions in `/lib`.
- **UI/UX Design**: Modern SaaS-style redesign with professional color schemes, glassmorphism effects, gradient hero sections, and responsive design. Features like dynamic form builders, comprehensive detail pages with tabbed interfaces, and professional action buttons are integrated. Emphasis on text readability and accessibility.

### Backend and Database Architecture
- **Database**: PostgreSQL
- **Data Persistence**: Prisma ORM with User and Webinar models, along with models for Registrations and Registration Forms.
- **Authentication System**: JWT-based sessions with role-based access control (ADMIN, HOST, CO_HOST, PANELIST, ATTENDEE). Supports email/password and Google OAuth.
- **API Endpoints**: REST API endpoints for webinar creation, management, registration, Stream token generation, and other functionalities.

### Key Features and Implementations
- **Webinar Creation System**: Comprehensive form functionality with validation using `react-hook-form` and Zod.
- **Registration System**: Dynamic form builder with drag-and-drop field ordering, various field types, capacity/deadline controls, public registration pages, and approval workflows.
- **Webinar Management Interface**: Tabbed interface for overview, settings, registration, advanced features, and analytics. Includes editing capabilities, registration link sharing, and quick actions.
- **Webinar Recording System**: Integration for auto-recording on webinar start, configurable quality, host recording controls, and visual status indicators.
- **Live Streaming**: Pre-scheduled call system with Stream.io integration. Host interface built with Stream React SDK, including video/audio controls, screen sharing, and participant management.

## External Dependencies

### Core Video Infrastructure
- **Stream.io**: Used for real-time video communication, including the Node SDK for server-side token generation and call management, and the React SDK for the client-side video interface.

### Database
- **PostgreSQL**: Relational database for data storage.

### Authentication
- **NextAuth.js**: Authentication library.
- **bcryptjs**: For password hashing.

### UI/UX Libraries
- **Tailwind CSS**: For styling.
- **@headlessui/react**: For accessible UI components.
- **@heroicons/react**: For icons.
- **clsx**: Utility for conditionally joining class names.
- **Lucide React**: Icon library.

### Form Management
- **react-hook-form**: For form validation and submission.
- **@hookform/resolvers**: Resolvers for `react-hook-form`.
- **zod**: Schema declaration and validation library.

### Date Handling
- **date-fns**: For date manipulation.

### Development Tools
- **Prisma**: ORM client.
- **tsx**: For running TypeScript files in development.
- **esbuild**: For backend bundling.