# Paper AI

<div align="center">

![Logo](https://via.placeholder.com/150x150?text=Paper+AI)

[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10.2-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**A collaborative real-time document editing platform with advanced AI capabilities**

</div>

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live presence indicators
- **Smart AI Writing Assistant**: Grammar checking, style suggestions, tone analysis, and writing enhancement
- **Document Analysis**: Content summarization, key points extraction, topic analysis, and readability scoring
- **Rich Content Generation**: Template system, content expansion, structure suggestions, and format recommendations
- **Rich Text Editing**: Powerful editor with markdown support, real-time cursors, and collaborative features
- **Document Export/Import**: Support for DOCX and PDF formats
- **Performance Monitoring**: Real-time metrics dashboard for system health and optimization

## 🚀 Tech Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth library
- **Real-time Features**: PartyKit
- **Editor**: BlockNote
- **AI**: OpenAI and Llama 3.1 8B Instant (via Groq API)
- **State Management**: Zustand, TanStack Query
- **Monitoring**: Custom metrics dashboard with Redis

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- OpenAI API key and/or Groq API key
- Redis instance (for metrics)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/paper_ai.git
cd paper_ai
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:

```bash
copy .env.example .env
```

4. Update the `.env` file with your configuration:
