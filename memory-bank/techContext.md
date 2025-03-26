# Technical Context

## Technology Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- Zustand (State Management)
- BlockNote Editor
- React Query (Server State)
- PartyKit (Real-time)

### Backend

- Next.js API Routes
- Prisma ORM
- Postgres (Database)
- PartyKit (Real-time)

### Authentication

- Better Auth library
- Email-based authentication
- JWT tokens
- Server-side sessions

### Development Tools

- ESLint
- Prettier
- PostCSS
- TypeScript

## Dependencies

### Core Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "prisma": "5.x",
  "@tanstack/react-query": "latest",
  "@partykit/sdk": "latest",
  "@partykit/client": "latest",
  "@blocknote/core": "latest",
  "@blocknote/react": "latest",
  "better-auth": "latest"
}
```

## Technical Constraints

1. Browser Support

   - Modern browsers only
   - No IE11 support required

2. Performance

   - Initial load < 3s
   - Real-time sync < 100ms

3. Security
   - HTTPS required
   - Secure auth flows
   - Protected API routes

## Development Setup

1. Node.js requirements

   - Node.js 18.0+
   - npm or yarn

2. Environment variables

   - DATABASE_URL
   - NEXTAUTH_SECRET
   - PARTYKIT_SECRET_KEY
   - BETTER_AUTH_SECRET
   - AI_API_KEY

3. Database

   - Postgres connection
   - Prisma migrations

4. Local Development
   - npm install
   - npm run dev
   - prisma generate
