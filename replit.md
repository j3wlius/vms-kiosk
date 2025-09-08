# Visitor Management Kiosk App

## Overview
A comprehensive React-based visitor management kiosk application designed for self-service check-in/check-out systems. The application features ID scanning with OCR, badge printing, camera integration, and a touch-friendly interface.

## Recent Changes
- **2025-09-08**: Initial Replit setup and configuration
  - Configured Vite to run on port 5000 with host 0.0.0.0 for Replit environment
  - Set up workflow for development server
  - Configured deployment settings for production builds
  - Successfully imported and tested the application

## Project Architecture
- **Frontend**: React 19+ with Vite build system
- **State Management**: Jotai for atomic state management
- **Styling**: Tailwind CSS 4+ with HeadlessUI components
- **Routing**: React Router DOM 7+
- **Forms**: React Hook Form with validation
- **Camera**: react-webcam for visitor photo capture
- **OCR**: Tesseract.js for ID document text extraction
- **Image Processing**: Jimp and html2canvas for image manipulation
- **Printing**: react-to-print for badge generation
- **Testing**: Jest, React Testing Library, Storybook
- **Package Manager**: pnpm (required - specified in packageManager field)

## Key Features
- Touch-optimized interface for kiosk environments
- ID document scanning with OCR text extraction
- Visitor photo capture and badge printing
- Multi-step check-in/check-out workflow
- Offline capability with sync when reconnected
- Accessibility compliance (WCAG guidelines)
- Multi-language support (i18next integration)
- Real-time status indicators
- Error recovery and fallback workflows

## Development Setup
- **Development Server**: Runs on port 5000 via `pnpm run dev`
- **Build Command**: `pnpm build` (generates production build)
- **Preview**: `pnpm preview` (serves production build)
- **Testing**: `pnpm test` (Jest test suite)
- **Storybook**: `pnpm storybook` (component documentation)

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: `pnpm build`
- **Run**: `pnpm preview --host 0.0.0.0 --port 5000`
- **Port**: 5000 (configured for Replit environment)

## File Structure
- `/src/components/screens/` - Main application screens
- `/src/components/ui/` - Reusable UI components
- `/src/components/forms/` - Form components with validation
- `/src/hooks/` - Custom React hooks for camera, OCR, printing
- `/src/services/` - API, storage, and hardware integration services
- `/src/stores/` - Jotai atom definitions for state management
- `/src/utils/` - Utility functions and helpers

## Important Notes
- Uses pnpm as package manager (do not use npm or yarn)
- Requires camera permissions for visitor photo capture
- Designed for touch interface (large buttons, accessible design)
- Supports offline operation with automatic sync
- GDPR compliant with configurable data retention
- SSL certificates optional (HTTP fallback configured)

## Current Status
✅ Successfully configured for Replit environment  
✅ Development server running on port 5000  
✅ All dependencies installed and working  
✅ Deployment configuration complete  
✅ Ready for development and production use