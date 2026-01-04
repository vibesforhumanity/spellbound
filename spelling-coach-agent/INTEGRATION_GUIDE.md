# iOS App Integration Guide

## Overview

The Spellbound iOS app now integrates with the Claude Agent SDK to generate adaptive multiple choice questions when students struggle with phonics patterns.

## Architecture

```
┌─────────────────┐      HTTP POST       ┌──────────────────┐
│  iOS App        │ ──────────────────>   │  Express Server  │
│  (AgentService) │                       │  (server.ts)     │
└─────────────────┘                       └──────────────────┘
                                                    │
                                                    │ uses
                                                    ▼
                                          ┌──────────────────┐
                                          │  Claude Agent    │
                                          │  SDK (agent.ts)  │
                                          └──────────────────┘
                                                    │
                                                    │ calls
                                                    ▼
                                          ┌──────────────────┐
                                          │  Claude API      │
                                          │  (Sonnet 4.5)    │
                                          └──────────────────┘
```

## Files Created

### Agent Server
- **`src/server.ts`** - Express HTTP API server
  - `POST /api/generate-question` - Generate pattern questions
  - `POST /api/analyze-session` - Analyze practice sessions
  - `GET /health` - Health check endpoint

### iOS Service
- **`Services/AgentService.swift`** - HTTP client for agent API
  - `generatePatternQuestion()` - Call agent for questions
  - `analyzePracticeSession()` - Send session results
  - `checkHealth()` - Verify API availability

### Updated Files
- **`Models/PracticeViewModel.swift`** - Now calls agent API instead of local generation
- **`Models/Word.swift`** - Added adaptive learning properties (patterns, difficulty, mastery)

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/ezakas/Spellbound/spelling-coach-agent
npm install
```

### 2. Configure Environment

Create `.env` file with your Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3000
```

### 3. Start the Agent Server

```bash
# Development mode (with hot reload)
npm run server

# Production mode
npm run build
npm start
```

You should see:

```
🎓 Spelling Coach Agent API running on http://localhost:3000
   Health check: http://localhost:3000/health
   Generate question: POST http://localhost:3000/api/generate-question
   Analyze session: POST http://localhost:3000/api/analyze-session

⚡ Using Claude Agent SDK with model: claude-sonnet-4-5-20250929
```

### 4. Run the iOS App

Build and run the Spellbound iOS app from Xcode. The app will automatically attempt to connect to the agent API at `http://localhost:3000`.

## How It Works

### Pattern Reinforcement Flow

1. **Student misspells a word** (e.g., "action" → "actshun")
2. **App detects incorrect pattern** (suffix -tion)
3. **App calls agent API** via `AgentService.generatePatternQuestion()`
4. **Agent generates question** using Claude Agent SDK
5. **Question displayed** to student as multiple choice
6. **Student selects answer**
7. **Feedback shown** with explanation
8. **If incorrect**, generate new question (max 3 attempts)
9. **If correct or max attempts**, continue to next word

### API Request Example

```swift
let question = await agentService.generatePatternQuestion(
    sessionId: "12345-67890",
    incorrectWord: "action",
    userAttempt: "actshun",
    pattern: "Suffix -tion",
    previousAttempts: 0
)
```

This sends to the server:

```json
{
  "sessionId": "12345-67890",
  "incorrectWord": "action",
  "userAttempt": "actshun",
  "pattern": "Suffix -tion",
  "previousAttempts": 0
}
```

### API Response Example

```json
{
  "success": true,
  "question": {
    "question": "Which word is spelled INCORRECTLY?",
    "options": [
      "a) nation",
      "b) vacation",
      "c) stashun",
      "d) mention"
    ],
    "correctAnswer": "c) stashun",
    "explanation": "The '-tion' suffix makes the 'shun' sound. Station is spelled with -tion, not -shun!"
  }
}
```

## Fallback Behavior

If the agent API is unavailable, the iOS app automatically falls back to local question generation:

```swift
if let question = question {
    // Use agent-generated question
} else {
    print("⚠️ Agent API unavailable, using local fallback")
    let localQuestion = createLocalPatternQuestion(...)
}
```

This ensures the app continues to work even if:
- The server is not running
- Network is unavailable
- API key is invalid
- Request times out

## Configuration

### Change Server URL

In `AgentService.swift`, update the base URL:

```swift
// For local development
init(baseURL: String = "http://localhost:3000")

// For production deployment
init(baseURL: String = "https://your-production-server.com")
```

### Change Claude Model

In `agent.ts`, update the default model:

```typescript
model = "claude-sonnet-4-5-20250929"  // Cost-efficient
// OR
model = "claude-opus-4-5-20251101"    // Highest quality
```

## Testing

### 1. Test Server Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","service":"spelling-coach-agent"}
```

### 2. Test Question Generation

```bash
curl -X POST http://localhost:3000/api/generate-question \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "incorrectWord": "action",
    "userAttempt": "actshun",
    "pattern": "Suffix -tion",
    "previousAttempts": 0
  }'
```

### 3. Test in iOS App

1. Start the agent server: `npm run server`
2. Run iOS app in Xcode
3. Complete a practice session
4. Intentionally misspell a word with a pattern (e.g., "beautiful" → "butiful")
5. Should see multiple choice question appear
6. Check server logs for API calls

## Monitoring

### Server Logs

The server logs all requests:

```
📝 Generating question for pattern: Suffix -tion
   Word: "action" | User attempt: "actshun"
   Attempt: 1/3

🎓 Starting spelling coach session: test-session-xyz
🤖 Model: claude-sonnet-4-5-20250929

[Coach Spark] Here's a question to help you...

✅ Question generated successfully

⏱️  Duration: 2341ms
💰 Cost: $0.009823
```

### iOS Logs

Check Xcode console for:

```
📡 Calling agent API: http://localhost:3000/api/generate-question
   Pattern: Suffix -tion | Attempt: 1/3
✅ Agent generated question successfully
```

Or if fallback:

```
❌ Network error: The Internet connection appears to be offline
⚠️ Agent API unavailable, using local fallback
```

## Cost Estimates

Using Claude Sonnet 4.5:

- **Per question**: ~$0.01 (2K input tokens + 500 output tokens)
- **Per student session** (15 words, ~3 pattern questions): ~$0.03
- **Monthly** (100 students, 12 sessions/month): ~$36/month

## Production Deployment

For production use, deploy the Express server to:

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **AWS Lambda**: Use serverless-http wrapper
- **DigitalOcean App Platform**: Connect GitHub repo

Update `AgentService.swift` with production URL:

```swift
init(baseURL: String = "https://spellbound-agent.herokuapp.com")
```

## Troubleshooting

### "Agent API unavailable"

1. Check if server is running: `curl http://localhost:3000/health`
2. Verify `ANTHROPIC_API_KEY` in `.env`
3. Check Xcode console for network errors
4. Ensure iOS simulator can reach localhost (it should by default)

### "Failed to generate question"

1. Check server logs for error details
2. Verify API key has sufficient credits
3. Check Claude API status: https://status.anthropic.com
4. Try test curl command from terminal

### Build Errors

1. Ensure all npm dependencies installed: `npm install`
2. TypeScript compilation: `npm run type-check`
3. iOS build: Clean build folder in Xcode (Cmd+Shift+K)

## Next Steps

1. ✅ **Basic Integration** - Complete
2. **Production Deployment** - Deploy server to cloud
3. **Session Analytics** - Track which patterns students struggle with
4. **Parent Dashboard** - Show progress using `analyzePracticeSession()`
5. **Kimi K2 Migration** - Self-host for cost optimization (see `KIMI_K2_MIGRATION.md`)

## API Reference

See `CLAUDE.md` for complete agent SDK documentation.

## Support

- Agent SDK Issues: Check `/Users/ezakas/Spellbound/spelling-coach-agent/CLAUDE.md`
- iOS Integration: Check this file
- Migration Guide: Check `/Users/ezakas/Spellbound/spelling-coach-agent/KIMI_K2_MIGRATION.md`
