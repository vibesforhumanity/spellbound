# Spelling Coach Agent

An intelligent, persistent AI coach for elementary school spelling and reading, built with the Claude Agent SDK.

## Quick Start

### Run as HTTP API Server (for iOS App)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Start the API server
npm run server
```

Server runs on `http://localhost:3000` with endpoints:
- `GET /health` - Health check
- `POST /api/generate-question` - Generate pattern questions
- `POST /api/analyze-session` - Analyze practice sessions

### Run Examples (Development)

```bash
# Run example coaching sessions
npm run dev
```

## Features

✅ **HTTP API Server**: Express server with REST endpoints for iOS app integration
✅ **Persistent Persona**: "Coach Spark" - expert in etymology, linguistics, and educational psychology
✅ **Session Management**: Tracks student progress across practice sessions
✅ **Pattern Analysis**: Identifies 70+ phonics patterns (digraphs, vowel teams, blends, etc.)
✅ **Adaptive Questions**: Generates multiple choice questions when students struggle with patterns
✅ **2-Way Coaching**: Answers questions about word origins, heteronyms, and spelling rules
✅ **iOS Integration**: Complete integration with Spellbound spelling practice app
✅ **Fallback Support**: iOS app works offline with local question generation
✅ **Model-Agnostic**: Designed for easy migration to Kimi K2 or other models

## Usage

### Basic Coaching
```typescript
import { runSpellingCoachAgent } from "./src/agent.js";

const { sessionContext, response } = await runSpellingCoachAgent(`
  Hi Coach Spark! I'm having trouble with the word "beautiful".
  Can you help me understand it better?
`);
```

### Analyze Practice Session (iOS App Integration)
```typescript
import { analyzePracticeSession } from "./src/agent.js";

const { sessionContext } = await analyzePracticeSession(
  "student-session-id",
  {
    correctWords: ["cat", "dog", "fish"],
    incorrectWords: ["beautiful", "treasure"],
    masteredPatterns: ["Short vowels"],
    challengingPatterns: ["Vowel team 'ea'"],
    missedWordsByPattern: {
      "Vowel team 'ea'": ["beautiful", "treasure"]
    }
  },
  "Why is 'beautiful' spelled with 'eau'?"  // Optional question
);
```

### Resume Previous Session
```typescript
import { resumeSpellingCoachSession } from "./src/agent.js";

const { response } = await resumeSpellingCoachSession(
  "previous-session-id",
  "Can you help me with the word 'friend' now?"
);
```

## Project Structure

```
spelling-coach-agent/
├── src/
│   ├── systemPrompt.ts      # Coach persona and expertise
│   ├── sessionManager.ts    # Session persistence
│   ├── agent.ts             # Main orchestration
│   └── index.ts             # Examples
├── .sessions/               # Persistent session data
├── CLAUDE.md                # Full documentation
├── KIMI_K2_MIGRATION.md     # Migration guide
└── README.md                # This file
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Complete project documentation, architecture, and API reference
- **[KIMI_K2_MIGRATION.md](./KIMI_K2_MIGRATION.md)**: Guide for migrating to self-hosted Kimi K2

## Scripts

```bash
npm run dev         # Run development examples
npm run build       # Build TypeScript to JavaScript
npm start           # Run production build
npm run type-check  # Type check without building
```

## Environment Variables

Create `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (for future Kimi K2 migration)
KIMI_API_KEY=your_kimi_key
KIMI_API_BASE_URL=https://api.moonshot.cn/v1
```

## Cost

**Claude Sonnet 4.5**: ~$0.01 per session
**Monthly (100 students, 3 sessions/week)**: ~$12/month

See [KIMI_K2_MIGRATION.md](./KIMI_K2_MIGRATION.md) for cost optimization with self-hosted models.

## Integration with Spellbound iOS App

The agent is designed to integrate seamlessly with the Spellbound spelling practice app:

1. **Student completes practice session** (15 words)
2. **App sends results** to `analyzePracticeSession()`
3. **Agent provides coaching** on patterns mastered vs. challenging
4. **Student can ask questions** about word origins, spelling rules
5. **Progress tracked** across sessions in `.sessions/` directory

See examples in `src/index.ts` for integration code.

## Architecture Highlights

- **Model-Agnostic Design**: Easy to swap Claude for Kimi K2 or other LLMs
- **Persistent Sessions**: Student context saved to disk, survives restarts
- **Educational Expertise**: System prompt includes 70+ phonics patterns and teaching methodology
- **Streaming Responses**: Real-time output for better UX
- **Cost Efficient**: Uses Sonnet (not Opus) for good balance of quality and cost

## Next Steps

1. **Test Prototype**: Run examples and validate coaching quality
2. **Integrate with iOS**: Connect to Spellbound app backend
3. **Monitor Usage**: Track cost and performance metrics
4. **Consider Migration**: Evaluate Kimi K2 for cost savings when volume increases

## License

MIT

## Support

- Review [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Check examples in `src/index.ts`
- Inspect session files in `.sessions/` for debugging
