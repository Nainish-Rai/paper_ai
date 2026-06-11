# Paper AI

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-local-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Open-source AI notes for turning public ChatGPT shares into collaborative, source-grounded documents.**

</div>

![image](https://github.com/user-attachments/assets/e927d9f4-9e54-4f2b-ae19-a7cdc3869587)
![image](https://github.com/user-attachments/assets/712a610c-90a2-44ad-afc9-833feaec6787)

## Features

- Import public ChatGPT share links into editable notes with the original source snapshot preserved.
- Ask a grounded note agent to summarize, extract action items, draft edits, and answer from the imported note.
- Edit rich documents with BlockNote and Yjs-backed collaboration through a local PartyKit server.
- Store users, documents, templates, permissions, and imports in local MongoDB for development.
- Use local email/password auth with JWT cookies.
- Keep dashboard state fast with TanStack Query and Zustand.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Data**: MongoDB Node driver with local MongoDB by default
- **Auth**: Local email/password auth with bcrypt and JWT cookies
- **Editor**: BlockNote
- **Realtime**: PartyKit, y-partykit, Yjs
- **AI**: Vercel AI SDK with OpenAI-compatible providers
- **State**: TanStack Query, Zustand

## Prerequisites

- Node.js 18+
- npm
- Local MongoDB, or a MongoDB URI in `LOCAL_MONGODB_URI`
- OpenAI API key for the note agent

On macOS with Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

## Local Setup

```bash
git clone https://github.com/Nainish-Rai/paper_ai.git
cd paper_ai
npm install --legacy-peer-deps
```

Create `.env.local`:

```bash
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=paper_ai
JWT_SECRET=replace-with-a-local-secret
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

Run the app and collaboration server:

```bash
npm run dev:full
```

Or run them separately:

```bash
npm run dev
npm run dev:collab
```

Next.js defaults to `http://localhost:3000`; PartyKit runs on `http://localhost:1999`.

## Manual Flow

1. Start local MongoDB.
2. Run `npm run dev:full`.
3. Sign up with email/password.
4. Import a public ChatGPT share from the dashboard.
5. Open the imported note, edit it, and use the note agent panel.

## Build Check

```bash
npx tsc --noEmit
npm run build
```
