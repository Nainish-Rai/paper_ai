# Active Context

## Current Focus

The project is in its initial development phase with focus on:

1. Better Auth integration and authentication system
2. Document management with React Query
3. BlockNote editor integration with PartyKit

## Recent Changes

- Set up Prisma with Postgres
- Implemented Better Auth for authentication
- Migrated from LiveBlocks to PartyKit for real-time collaboration
- Implemented BlockNote editor with real-time sync
- Added document sharing functionality
- Added confirmation dialogs for destructive actions
- Integrated React Query for data fetching

## Active Decisions

1. Authentication

   - Better Auth library for authentication system
   - Email-based authentication for simplicity
   - JWT-based session management
   - Server-side authentication checks

2. Editor Implementation

   - BlockNote for rich text editing
   - PartyKit integration for real-time sync
   - Collaborative editing features
   - Theme support (light/dark)

3. Data Management
   - React Query for server state management
   - Document creation and sharing
   - Document deletion with owner validation
   - User permissions system
   - Real-time updates
   - Protection against unauthorized deletions

## Current Considerations

1. Security

   - Better Auth security implementation
   - Protected API routes
   - Data validation
   - Owner-only deletion permissions

2. Performance
   - React Query caching optimization
   - Real-time sync optimization
   - BlockNote editor performance
   - Database query optimization
   - Efficient document state management

## Next Steps

1. Authentication Enhancements

   - Better Auth features configuration
   - User profile management
   - Session handling improvements
   - Security optimizations

2. Data Layer Improvements

   - React Query cache strategies
   - Optimistic updates implementation
   - Real-time sync with PartyKit
   - Error handling patterns

3. Editor Features

   - BlockNote extension configuration
   - Additional collaboration features
   - AI integration with editor
   - Custom menu and toolbar

4. Document System

   - Advanced permissions
   - User roles
   - Activity tracking
   - Document versioning

5. Dashboard Implementation
   - Document management UI
   - User settings
   - Activity overview
   - Bulk operations on documents
