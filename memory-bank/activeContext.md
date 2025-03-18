# Active Context

## Current Focus

The project is in its initial development phase with focus on:

1. Authentication system implementation
2. Basic room creation functionality
3. TipTap editor integration with LiveBlocks

## Recent Changes

- Set up Prisma with Postgres
- Implemented email-based authentication
- Created basic room management
- Added LiveBlocks configuration
- Switched to TipTap editor for rich text editing
- Added room and document deletion functionality with proper validation
- Implemented confirmation dialogs for destructive actions

## Active Decisions

1. Authentication

   - Using email-only authentication for simplicity
   - JWT-based session management
   - Server-side authentication checks

2. Editor Implementation

   - TipTap for rich text editing
   - LiveBlocks integration for real-time sync
   - Collaborative editing features
   - Extensible plugin system

3. Room Management
   - Room creation and joining
   - Room and document deletion with owner validation
   - User permissions system
   - Real-time updates
   - Protection against unauthorized deletions

## Current Considerations

1. Security

   - Secure authentication flows
   - Protected API routes
   - Data validation
   - Owner-only deletion permissions

2. Performance
   - Real-time sync optimization
   - TipTap editor performance
   - Database query optimization
   - Efficient cascade deletions

## Next Steps

1. Complete authentication system

   - User profile management
   - Session handling
   - Security improvements

2. Enhance Editor Features

   - TipTap extension configuration
   - Rich text collaboration features
   - AI integration with editor
   - Custom menu and toolbar

3. Room System

   - Advanced permissions
   - User roles
   - Activity tracking
   - Room archiving feature

4. Dashboard Implementation
   - Room management UI
   - User settings
   - Activity overview
   - Bulk operations on rooms/documents
