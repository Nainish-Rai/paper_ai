# Active Context

## Current Focus

- Enhanced editor capabilities with AI features
- Real-time collaboration improvements
- Document management system

## Latest Changes

### AI Integration

- Added AI completion feature to the editor
  - Uses Groq API with Llama 3.1 8B Instant
  - Streaming completions for better UX
  - Context-aware text generation
  - Integrated with BlockNote editor

### New AI Features

- Grammar checking
- Style improvement
- Content summarization
- Text expansion
- Dual-mode rate limiting:
  - Redis in production
  - In-memory in development
- Real-time selection integration

### Editor Improvements

- AI toolbar in editor header
- Enhanced editing capabilities
- Better content handling
- User-aware editing context

## Active Decisions

1. Using BlockNote for rich text editing
2. AI completions stream directly into editor
3. Real-time sync with PartyKit
4. Flexible rate limiting strategy
   - Redis for production
   - In-memory for development
5. Document sharing and permissions

## Current Considerations

- AI model optimization
- Streaming performance
- Error handling and fallbacks
- User feedback mechanisms
- Performance monitoring
- Redis configuration in production
- Development environment setup

## Next Steps

- [ ] Add Redis configuration to production environment
- [ ] Add user feedback UI for AI features
- [ ] Implement keyboard shortcuts
- [ ] Add AI command palette
- [ ] Enhance error handling
- [ ] Improve collaborative features

## Environment Setup Required

1. Production Environment:

   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
   - OPENAI_API_KEY (for Groq)

2. Development Environment:
   - OPENAI_API_KEY (for Groq)
   - No Redis required (uses in-memory)
