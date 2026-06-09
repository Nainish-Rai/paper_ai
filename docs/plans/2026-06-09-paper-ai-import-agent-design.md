# Paper AI Import Agent Design

Date: 2026-06-09

## Product Thesis

Paper AI should not compete as a broad Notion clone. The sharp open-source pitch is:

> Import public ChatGPT conversations into durable, editable, collaborative notes that can be searched, cited, summarized, and exported.

The highest-signal user demand from Reddit/HN/web research is practical capture and retrieval: users want simple notes, reliable sync, ownership/portability, and less manual copy-paste from AI chats. OpenAI's Shared Links FAQ confirms public ChatGPT links are accessible to anyone with the URL, may be deleted by the owner later, and normal shared links are snapshots up to the share point. That makes local snapshot import the correct core behavior.

## Sources

- OpenAI Shared Links FAQ: https://help.openai.com/en/articles/7925741-chatgpt-shared-links-faq
- Vercel AI SDK tool calling: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- Vercel AI SDK streamText: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
- Vercel AI SDK agents: https://ai-sdk.dev/docs/agents/building-agents
- Reddit demand examples:
  - https://www.reddit.com/r/productivity/comments/1ksrlyh/why_is_finding_a_decent_notes_app_still_this_hard/
  - https://www.reddit.com/r/ChatGPT/comments/zy7qsc/sharing_chat_gpt_conversations/
  - https://www.reddit.com/r/Notion/comments/1jtbkny/my_deep_dive_into_25_ai_notetaking_apps_the/

## Core Feature List

1. Import from ChatGPT
   - Accept only `https://chatgpt.com/share/<id>` and legacy `https://chat.openai.com/share/<id>` URLs.
   - Fetch the public page server-side.
   - Extract title, visible conversation text when available, source URL, imported timestamp, and raw text snapshot.
   - Create a new document with a clean note structure: source, summary placeholder, transcript, and action items placeholder.
   - Show a privacy warning before import: anyone with the source link may view it; users should not import sensitive chats.

2. Minimal Collaborative Editor
   - Keep BlockNote + Yjs + PartyKit.
   - Remove hard-coded PartyKit host and use `NEXT_PUBLIC_PARTYKIT_HOST`.
   - Keep autosave feedback honest: saving, saved, failed.
   - Avoid adding databases, kanban, calendars, or heavy Notion-style systems in the MVP.

3. Real-Time Note Agent
   - Use latest Vercel AI SDK patterns: `streamText`, typed `tool(...)`, and later `ToolLoopAgent` where the installed SDK supports it.
   - Initial tools:
     - `getCurrentDocument`
     - `searchUserDocuments`
     - `summarizeImportedChat`
     - `extractActionItems`
     - `writeToDocument` with explicit user-triggered writes only
   - Agent output must be grounded in current document/source text and avoid pretending it can access deleted upstream links.

4. MongoDB Readiness
   - The current app uses Prisma/Postgres for auth/documents. A full auth migration is too risky for a first slice.
   - Add a MongoDB client and imported-chat snapshot collection first.
   - Store import metadata in MongoDB while keeping the existing document table as the editor's canonical document list until a deliberate migration replaces Prisma.

## Architecture

```text
Dashboard
  -> Import ChatGPT dialog
  -> POST /api/import/chatgpt
      -> validate URL
      -> fetch public shared page
      -> parse readable snapshot
      -> save import snapshot in MongoDB
      -> create editable document in existing document store
      -> return document id

Editor
  -> BlockNote + Yjs provider
  -> debounced document autosave
  -> AI side panel / command menu
      -> POST /api/ai/agent
          -> Vercel AI SDK streamText/tools
          -> read current document/import snapshot
          -> stream grounded answer
```

## Data Model

MongoDB collection: `imported_chats`

```ts
type ImportedChat = {
  _id: ObjectId;
  userId: string;
  documentId: string;
  source: "chatgpt";
  sourceUrl: string;
  sourceId: string;
  title: string;
  rawText: string;
  messages: Array<{
    role: "user" | "assistant" | "system" | "unknown";
    content: string;
    index: number;
  }>;
  summary?: string;
  tags: string[];
  importStatus: "imported" | "partial";
  createdAt: Date;
  updatedAt: Date;
};
```

Indexes:

- `{ userId: 1, createdAt: -1 }`
- `{ documentId: 1 }` unique
- `{ source: 1, sourceId: 1, userId: 1 }`

## Skill Audits

### System Design

Score: 7/10 now.

The design has a clear vertical slice and avoids premature distributed complexity. It needs stronger production readiness: import queueing for slow pages, observability, rate limits, and a single chosen long-term database strategy.

### Pragmatic Programmer

Use a tracer bullet: one import link creates one editable collaborative note and one MongoDB snapshot. Do not migrate auth, permissions, templates, analytics, and editor storage in the same slice.

### Hooked UX

Trigger: user finds a valuable ChatGPT chat and wants to keep it.
Action: paste link and import.
Variable reward: AI extracts decisions, follow-ups, and reusable insights.
Investment: the imported library becomes searchable and exportable.

Ethical boundary: no dark patterns, no hidden scraping of private chats, and no claim that deleted upstream links remain available unless we imported a snapshot.

### UX Heuristics

Primary flow must be obvious from the dashboard: `Import ChatGPT`, paste URL, import, land in the note.

Errors must be specific:

- Invalid link: "Paste a public ChatGPT shared link."
- Fetch blocked/deleted: "This shared link is not available. Check that it is public."
- Partial extraction: "Imported visible text only. Review before relying on it."

### Clean Code

Keep import parsing in `lib/importers/chatgpt.ts`, persistence in `lib/mongodb.ts` and `lib/repositories/importedChats.ts`, and route orchestration in the API route. Avoid ad hoc string manipulation in route files.

### DDIA

The imported shared chat snapshot is immutable source evidence plus derived document content. Store the snapshot separately from the editable document so later edits do not corrupt provenance. Use document-local operations; avoid distributed transactions in the first slice. If document creation succeeds but Mongo insert fails, return a clear partial state and retry path.

### Web Typography

Use a workhorse system stack, 16px minimum UI text, 45-75ch editor measure, normal letter spacing, and modest headings inside the product UI. The product should feel quiet and fast, not like a marketing page.

### Microinteractions / Emil Kowalski Animation

Animations must communicate state, not decorate. Use transform/opacity only, keep common UI transitions under 200ms, add button press feedback around `scale(0.97)`, and respect reduced motion. Import feedback should move through `idle -> importing -> imported -> failed`.

## Implementation Order

1. Clean unsafe config and make builds runnable.
2. Add this design plan.
3. Add MongoDB client/repository and ChatGPT shared-link parser tests.
4. Add `/api/import/chatgpt`.
5. Add dashboard import dialog and route into created document.
6. Upgrade Vercel AI SDK usage and add agent route with tools.
7. Replace hard-coded PartyKit host and polish editor autosave feedback.
8. Verify with typecheck/build and browser smoke tests.
