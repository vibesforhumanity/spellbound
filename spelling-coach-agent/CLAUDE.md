# Spelling Coach Agent - Project Documentation

## Overview
An intelligent spelling and reading coach for elementary school children (ages 6-11) built with the Claude Agent SDK. The agent, "Coach Spark," provides personalized coaching based on etymology, educational psychology, and linguistics.

## Project Structure

```
spelling-coach-agent/
├── src/
│   ├── systemPrompt.ts       # Coach persona and expertise definition
│   ├── sessionManager.ts     # Session persistence and context management
│   ├── agent.ts              # Main agent orchestration logic
│   └── index.ts              # Example usage and entry point
├── .sessions/                # Persistent session storage (gitignored)
├── .env                      # API keys (gitignored)
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── CLAUDE.md                 # This file
```

## Core Components

### 1. System Prompt (`systemPrompt.ts`)

Defines Coach Spark's:
- **Core Expertise**: Etymology, educational psychology, linguistics, phonics patterns
- **Personality**: Encouraging, patient, playful, clear communicator
- **Teaching Approach**: Multi-sensory learning, pattern recognition, positive reinforcement
- **Phonics Knowledge**: 70+ patterns (digraphs, vowel teams, blends, r-controlled, suffixes, prefixes, silent letters)
- **Safety**: Age-appropriate, inclusive, kid-friendly language

The system prompt is designed to be model-agnostic and can be used with any LLM.

### 2. Session Manager (`sessionManager.ts`)

Handles persistent session storage and context:

**SessionContext Interface:**
```typescript
{
  sessionId: string
  studentName?: string
  gradeLevel?: string
  masteredWords: string[]
  strugglingWords: string[]
  masteredPatterns: string[]
  strugglingPatterns: string[]
  learningStyle?: "visual" | "auditory" | "kinesthetic" | "mixed"
  notes: string[]
  createdAt: string
  lastUpdated: string
}
```

**Key Functions:**
- `loadSession(sessionId)` - Load existing session from disk
- `saveSession(context)` - Persist session to disk
- `createSessionContext(sessionId)` - Initialize new session
- `updateSessionFromPractice(sessionId, results)` - Update based on practice results
- `buildSessionContextMessage(context)` - Generate context for system prompt

Sessions are stored as JSON files in `.sessions/` directory.

### 3. Agent (`agent.ts`)

Main orchestration layer with three key functions:

#### `runSpellingCoachAgent(userPrompt, options)`
Run a new coaching session with custom options.

**Parameters:**
- `userPrompt`: Student's message or question
- `options`:
  - `sessionId`: Optional session ID (auto-generated if not provided)
  - `model`: Claude model to use (default: "claude-sonnet-4-5-20250929")
  - `allowedTools`: Array of tool names (default: ["Read", "WebSearch"])

**Returns:**
```typescript
{
  sessionContext: SessionContext
  response: string
}
```

#### `resumeSpellingCoachSession(sessionId, userPrompt, model)`
Continue an existing session.

**Parameters:**
- `sessionId`: ID of existing session
- `userPrompt`: New message/question
- `model`: Claude model (optional)

#### `analyzePracticeSession(sessionId, practiceResults, studentQuestion?)`
**Primary iOS App Integration Point** - Analyze practice session and provide coaching.

**Parameters:**
```typescript
{
  sessionId: string
  practiceResults: {
    correctWords: string[]
    incorrectWords: string[]
    masteredPatterns: string[]
    challengingPatterns: string[]
    missedWordsByPattern: Record<string, string[]>
  }
  studentQuestion?: string  // Optional follow-up question
}
```

This function:
1. Updates session context with practice results
2. Identifies patterns to focus on
3. Provides targeted coaching and tips
4. Answers any student questions about word origins, heteronyms, etc.

## Usage Examples

### Example 1: Basic Coaching
```typescript
import { runSpellingCoachAgent } from "./agent.js";

const { sessionContext, response } = await runSpellingCoachAgent(`
  Hi Coach Spark! I'm having trouble with the word "beautiful".
  Can you help?
`);

console.log(sessionContext.sessionId);
```

### Example 2: iOS App Integration
```typescript
import { analyzePracticeSession } from "./agent.js";

// After a Spellbound practice session
const results = {
  correctWords: ["cat", "dog", "fish"],
  incorrectWords: ["beautiful", "treasure"],
  masteredPatterns: ["Short vowels (CVC)"],
  challengingPatterns: ["Vowel team 'ea'"],
  missedWordsByPattern: {
    "Vowel team 'ea'": ["beautiful", "treasure"]
  }
};

const { sessionContext } = await analyzePracticeSession(
  "emma-session-123",
  results,
  "Why is beautiful spelled with 'eau'?"
);
```

### Example 3: Resume Session
```typescript
import { resumeSpellingCoachSession } from "./agent.js";

const { response } = await resumeSpellingCoachSession(
  "emma-session-123",
  "Can you help me with 'friend' now?"
);
```

## Running the Agent

### Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=sk-ant-...
```

### Development
```bash
# Run examples
npm run dev

# Type check
npm run type-check
```

### Production
```bash
# Build
npm run build

# Run
npm start
```

## Model Configuration

### Current: Claude Sonnet 4.5
```typescript
model: "claude-sonnet-4-5-20250929"
```

**Why Sonnet:**
- Excellent reasoning for educational content
- Cost-efficient for production ($3/MTok input, $15/MTok output)
- Fast response times
- Great for multi-turn conversations

**Alternative: Claude Opus 4.5** (for maximum quality)
```typescript
model: "claude-opus-4-5-20251101"
```

## Tools Enabled

### Read
Access reference materials, example texts, word lists.

### WebSearch
Find real-world examples of word usage, research etymology.

### Edit (disabled by default)
Can be enabled for creating learning materials or worksheets.

## Integration with Spellbound iOS App

### Flow:
1. **Practice Session**: Student completes 15-word spelling session in iOS app
2. **Results Collection**: App collects:
   - Correct/incorrect words
   - Mastered/challenging patterns
   - Specific errors per pattern
3. **Agent Analysis**: App calls `analyzePracticeSession()` with results
4. **Coaching Feedback**: Agent provides:
   - Celebration of mastered patterns
   - Targeted tips for challenging patterns
   - Etymology explanations
   - Practice word suggestions
5. **Session Update**: Context saved for next practice session

### Example Integration Code:
```typescript
// In your iOS app backend or serverless function
import { analyzePracticeSession } from "spelling-coach-agent";

async function processSpellboundSession(userId: string, sessionResults: any) {
  const sessionId = `user-${userId}`;

  const { sessionContext, response } = await analyzePracticeSession(
    sessionId,
    {
      correctWords: sessionResults.correct,
      incorrectWords: sessionResults.incorrect,
      masteredPatterns: sessionResults.mastered,
      challengingPatterns: sessionResults.challenging,
      missedWordsByPattern: sessionResults.errors
    },
    sessionResults.studentQuestion
  );

  // Return coaching feedback to display in iOS app
  return {
    coaching: response,
    progress: {
      totalMastered: sessionContext.masteredWords.length,
      currentFocus: sessionContext.strugglingPatterns
    }
  };
}
```

## Cost Estimation

### Per Session (Claude Sonnet 4.5):
- Input: ~2,000 tokens (system prompt + session context + user prompt)
- Output: ~500 tokens (coaching response)
- Cost: ~$0.01 per session

### Monthly (100 active students, 3 sessions/week):
- 1,200 sessions/month
- ~$12/month

### Optimization Tips:
- Cache system prompt across sessions (reduces input tokens)
- Use Haiku for simple acknowledgments ($0.25/MTok)
- Batch multiple student questions when possible

## Performance Benchmarks

- **Session Load Time**: <50ms (disk I/O)
- **Agent Response Time**: 2-5 seconds (depends on model and complexity)
- **Session Save Time**: <20ms (async write)

## Security & Privacy

### Data Storage:
- Sessions stored locally in `.sessions/` directory
- No data sent to external services except Anthropic API
- Session files contain only educational data (no PII beyond first name if provided)

### Recommendations:
- Encrypt session files at rest for production
- Use environment variables for all API keys
- Implement rate limiting for API calls
- Add input validation for user prompts

## Future Enhancements

### Phase 1 (Completed):
- ✅ Persistent persona with etymology/linguistics expertise
- ✅ Session management and context persistence
- ✅ Practice session analysis
- ✅ 2-way Q&A for word origins

### Phase 2 (Kimi K2 Migration):
- 🔄 Model-agnostic interface design (completed)
- ⏳ Self-hosted Kimi K2 deployment
- ⏳ Cost optimization with open models
- ⏳ Performance benchmarking vs Claude

### Phase 3 (Advanced Features):
- ⏳ Multi-student progress tracking
- ⏳ Parent/teacher dashboard
- ⏳ Adaptive difficulty adjustment
- ⏳ Voice interaction support
- ⏳ Gamification elements

## Troubleshooting

### "Session not found" error
```bash
# Check if session file exists
ls -la .sessions/

# Verify session ID matches filename
# Format: spelling-YYYY-MM-DD-XXXXXX.json
```

### API key errors
```bash
# Verify .env file exists and has correct key
cat .env | grep ANTHROPIC_API_KEY

# Test API key directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### TypeScript errors
```bash
# Clear build cache
rm -rf dist/
npm run type-check
```

## Contributing

When modifying the agent:

1. **System Prompt Changes**: Test with multiple student scenarios
2. **Session Manager Changes**: Ensure backward compatibility with existing sessions
3. **Agent Logic Changes**: Maintain model-agnostic design for future migration
4. **Cost Impact**: Monitor token usage changes with `console.log`

## License

MIT

## Support

For issues or questions:
- Check examples in `src/index.ts`
- Review session files in `.sessions/`
- Enable verbose logging in agent.ts
- Consult Claude Agent SDK docs: https://docs.anthropic.com/agent-sdk
