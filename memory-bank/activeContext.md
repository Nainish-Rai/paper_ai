# Active Context

## Current Focus

The project is in its initial development phase with focus on:

1. Authentication system implementation
2. Document management and sharing
3. BlockNote editor integration with PartyKit

## Recent Changes

- Set up Prisma with Postgres
- Implemented email-based authentication
- Migrated from LiveBlocks to PartyKit for real-time collaboration
- Implemented BlockNote editor with real-time sync
- Added document sharing functionality
- Added confirmation dialogs for destructive actions

## Active Decisions

1. Authentication

   - Using email-only authentication for simplicity
   - JWT-based session management
   - Server-side authentication checks

2. Editor Implementation

   - BlockNote for rich text editing
   - PartyKit integration for real-time sync
   - Collaborative editing features
   - Theme support (light/dark)

3. Document Management
   - Document creation and sharing
   - Document deletion with owner validation
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
   - BlockNote editor performance
   - Database query optimization
   - Efficient document state management

## Next Steps

1. Complete authentication system

   - User profile management
   - Session handling
   - Security improvements

2. Enhance Editor Features

   - BlockNote extension configuration
   - Additional collaboration features
   - AI integration with editor
   - Custom menu and toolbar

3. Document System

   - Advanced permissions
   - User roles
   - Activity tracking
   - Document versioning

4. Dashboard Implementation
   - Document management UI
   - User settings
   - Activity overview
   - Bulk operations on documents
