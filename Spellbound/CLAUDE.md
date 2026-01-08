# Spellbound iOS App - Project Documentation

## Overview
An AI-powered spelling practice app for elementary school children. Features pattern-based learning, intelligent word selection, and personalized coaching from "Coach Spark" (OpenAI-powered agent backend).

## Project Structure

```
Spellbound/
├── Spellbound/
│   ├── App/
│   │   └── SpellboundApp.swift          # App entry point
│   ├── Core/
│   │   └── Extensions/                  # Swift extensions
│   ├── Models/
│   │   ├── Word.swift                   # Core word model with pattern metadata
│   │   ├── Session.swift                # Practice session tracking
│   │   ├── PhonicsPattern.swift         # 70+ phonics patterns
│   │   ├── PatternPerformance.swift     # Per-pattern statistics
│   │   └── PracticeViewModel.swift      # Main practice logic
│   ├── Services/
│   │   ├── WordService.swift            # Word loading and management
│   │   ├── StorageService.swift         # UserDefaults persistence
│   │   ├── TTSService.swift             # Text-to-speech (local + OpenAI)
│   │   ├── AgentService.swift           # Backend API client
│   │   ├── PhonicsPatternService.swift  # Pattern detection
│   │   └── AdaptiveSelectionService.swift # Intelligent word selection
│   ├── Features/
│   │   └── Practice/                    # Practice session views
│   ├── Views/
│   │   ├── ContentView.swift            # Main navigation
│   │   ├── PracticeView.swift           # Main practice UI
│   │   ├── ResultsView.swift            # Session results
│   │   ├── RewardsView.swift            # Gem collection UI
│   │   └── Components/
│   │       ├── FeedbackView.swift       # Agent coaching feedback
│   │       ├── MultipleChoiceView.swift # Pattern reinforcement
│   │       └── WordInputView.swift      # Custom letter boxes
│   └── Assets.xcassets/
└── CLAUDE.md                            # This file
```

## Architecture

### MVVM Pattern
- **Models**: Word, Session, PhonicsPattern, PatternPerformance
- **ViewModels**: PracticeViewModel (main session orchestrator)
- **Views**: SwiftUI views with @StateObject/@ObservedObject bindings
- **Services**: Singleton services for cross-cutting concerns

### Data Flow
1. **Word Selection**: AdaptiveSelectionService → WordService → PracticeViewModel
2. **User Input**: WordInputView → PracticeViewModel.checkAnswer()
3. **Pattern Detection**: PhonicsPatternService analyzes words on app launch
4. **Agent Coaching**: FeedbackView → AgentService → Coach Spark API
5. **Persistence**: StorageService (UserDefaults) for sessions, gems, stats

## Logging Guidelines

### ⚠️ IMPORTANT: Use OSLog, Not Print Statements

**DO NOT use `print()` for logging in production code.**

Instead, use Apple's unified logging system:

```swift
import OSLog

// Define logger per subsystem
private let logger = Logger(subsystem: "com.vibesforhumanity.Spellbound", category: "PracticeSession")

// Log levels
logger.debug("Detailed info for debugging")
logger.info("General informational message")
logger.notice("Important but normal event")
logger.warning("⚠️ Something unexpected happened")
logger.error("❌ Error occurred")
logger.fault("🔥 Critical failure")
```

### Logging Categories

Create category-specific loggers:

```swift
// Network calls
private let networkLogger = Logger(subsystem: "com.vibesforhumanity.Spellbound", category: "Network")

// Pattern detection
private let patternLogger = Logger(subsystem: "com.vibesforhumanity.Spellbound", category: "Patterns")

// User actions
private let uiLogger = Logger(subsystem: "com.vibesforhumanity.Spellbound", category: "UI")

// Agent interactions
private let agentLogger = Logger(subsystem: "com.vibesforhumanity.Spellbound", category: "Agent")
```

### Migration from Print to Logger

**Before (DON'T DO THIS):**
```swift
print("🎓 FETCHING AGENT FEEDBACK")
print("   Correct word: \(word)")
print("❌ Failed to fetch agent feedback: \(error)")
```

**After (DO THIS):**
```swift
agentLogger.info("Fetching agent feedback for word: \(word)")
agentLogger.error("Failed to fetch agent feedback: \(error.localizedDescription)")
```

### Structured Logging

Use string interpolation with privacy annotations:

```swift
// Public data (safe to log)
logger.info("Practice session started with \(wordCount) words")

// Private data (user content - redact in production)
logger.debug("User attempt: \(userAttempt, privacy: .private)")
logger.debug("Incorrect patterns: \(patterns, privacy: .private)")

// Auto redaction for sensitive data
logger.info("Session ID: \(sessionId, privacy: .auto)")
```

### Performance Logging

```swift
import OSSignposter

let signposter = OSSignposter(subsystem: "com.vibesforhumanity.Spellbound", category: .pointsOfInterest)

// Mark performance-critical sections
let state = signposter.beginInterval("PatternAnalysis")
// ... expensive operation ...
signposter.endInterval("PatternAnalysis", state)
```

### Viewing Logs

**During Development:**
- Logs appear in Xcode console
- Use Console.app to filter by subsystem/category

**In Production:**
```bash
# On device/simulator
log stream --predicate 'subsystem == "com.vibesforhumanity.Spellbound"'

# Filter by category
log stream --predicate 'subsystem == "com.vibesforhumanity.Spellbound" && category == "Network"'

# Filter by level
log stream --level debug --predicate 'subsystem == "com.vibesforhumanity.Spellbound"'
```

## Key Patterns

### Pattern Detection
- Runs once on app launch
- Detects 70+ phonics patterns in all words
- Stored in Word.patterns array
- Used for adaptive selection and feedback

### Adaptive Selection
- 60% weak patterns (accuracy < 70%)
- 40% gradual difficulty progression
- Cross-session mastery tracking
- Session size: 15 words

### Pattern Reinforcement
- Triggered after incorrect spelling
- Shows multiple choice question
- Max 3 attempts per pattern
- Agent-generated questions via Coach Spark

### Agent Integration
- **Endpoint**: Railway-hosted Python FastAPI backend
- **Agent**: OpenAI GPT-4o with curriculum knowledge
- **Features**:
  - Personalized feedback on misspellings
  - Pattern-aware multiple choice generation
  - Natural voice TTS (OpenAI "nova" voice)
  - 2-way Q&A ("Ask Coach Spark")

### State Management
- PracticeViewModel: Main session state
- @Published properties for UI reactivity
- UserDefaults for persistence
- In-memory conversation history (per session)

## API Integration

### AgentService Endpoints

```swift
// Generate pattern reinforcement question
func generatePatternQuestion(
    sessionId: String,
    incorrectWord: String,
    userAttempt: String,
    pattern: String,
    previousAttempts: Int
) async -> MultipleChoiceQuestion?

// Get personalized coaching feedback
func getFeedback(
    sessionId: String,
    studentId: String,
    incorrectWord: String,
    userAttempt: String,
    incorrectPatterns: [String]
) async -> String?

// Text-to-speech
func textToSpeech(text: String) async -> Data?
```

### Request Format (snake_case)

**Important**: Backend uses Python/FastAPI conventions (snake_case), not Swift (camelCase).

```swift
let requestBody: [String: Any] = [
    "session_id": sessionId,        // NOT sessionId
    "incorrect_word": word,         // NOT incorrectWord
    "user_attempt": attempt,        // NOT userAttempt
    "incorrect_patterns": patterns  // NOT incorrectPatterns
]
```

## Testing

### Pattern Detection
```swift
// Test word analysis
let word = Word(text: "championship", grade: 5, difficulty: 3)
let patterns = patternService.detectPatterns(in: word.text)
// Expected: ch- (digraph), -ion (suffix), -ship (suffix)
```

### Adaptive Selection
```swift
// Simulate weak pattern
var word = wordService.allWords.first { $0.patterns.contains(where: { $0.type == .digraph_sh }) }
word?.timesIncorrect = 5
word?.timesCorrect = 1
// Next session should prioritize sh-pattern words
```

### Agent Feedback
```swift
// Check logs for agent call
// Should see:
// 🎓 FETCHING AGENT FEEDBACK
// 📡 Calling endpoint: https://...
// ✅ Got agent feedback (XXX chars)
```

## Common Issues

### Issue: Generic Tips Instead of Agent Feedback
**Symptoms**: Seeing pattern.tipMessage instead of personalized coaching
**Debug**:
1. Check Xcode console for network errors
2. Verify Railway backend is running
3. Check AgentService.baseURL is correct
4. Look for "❌ Failed to fetch agent feedback" in logs

### Issue: Pattern Questions Not Context-Aware
**Symptoms**: Multiple choice options don't reflect user's misspelling
**Debug**:
1. Verify user_attempt is being sent to backend
2. Check backend logs for prompt content
3. Ensure OpenAI API key is configured

### Issue: Build Errors After Changes
**Symptoms**: Parameter shadowing, type mismatches
**Common Fixes**:
- Use `self.property` to disambiguate instance vars from parameters
- Check @Published var types match UI bindings
- Verify Codable conformance for new model fields

## Performance Benchmarks

- Pattern analysis (1,190 words): 0.1-0.2s
- Word selection: <0.01s
- Session save: <20ms
- Agent feedback: 2-5s (network + OpenAI)
- TTS generation: 1-3s (OpenAI API)

## Code Style

### Naming Conventions
- Models: PascalCase (Word, Session)
- Properties: camelCase (incorrectPatterns, userAttempt)
- Functions: camelCase (checkAnswer, nextWord)
- Constants: lowerCamelCase or UPPER_SNAKE_CASE
- Views: PascalCase with "View" suffix

### SwiftUI Views
- Keep body under 150 lines
- Extract complex subviews
- Use @ViewBuilder for conditional layouts
- Prefer GeometryReader sparingly

### Async/Await
- Use Task {} for async work in views
- Use await MainActor.run {} for UI updates
- Handle errors with do/catch
- Log errors with logger.error()

## Git Workflow

### Commit Messages
```
Category: Brief description

Detailed explanation of what changed and why.

Changes:
- Specific change 1
- Specific change 2

Fixes issue where [describe problem solved]

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Pre-commit Checklist
- [ ] Build succeeds with no errors/warnings
- [ ] Replaced print() with logger calls
- [ ] Added privacy annotations for sensitive data
- [ ] Tested on simulator
- [ ] Updated CLAUDE.md if architecture changed

## Future Enhancements

### Planned Features
- [ ] Multi-user support with CloudKit
- [ ] Parent dashboard (progress tracking)
- [ ] Achievements and streak tracking
- [ ] Voice input for spelling
- [ ] iPad split-screen support
- [ ] Dark mode support

### Tech Debt
- [ ] Migrate all print() to Logger
- [ ] Add unit tests for pattern detection
- [ ] Implement proper error types (not HTTPURLResponse)
- [ ] Cache agent responses
- [ ] Add offline mode for core features

## Resources

- [OSLog Documentation](https://developer.apple.com/documentation/os/logging)
- [SwiftUI Best Practices](https://developer.apple.com/documentation/swiftui)
- [Async/Await Guide](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html)
- [Coach Spark Agent Docs](../spelling-coach-agent/CLAUDE.md)

## Support

For issues:
1. Check Xcode console logs (filtered by subsystem)
2. Review this document for common patterns
3. Check backend logs on Railway
4. Verify API endpoints are accessible

---

Last Updated: 2026-01-07
