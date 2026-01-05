# Spellbound AI Coach - OpenAI Assistant Migration Plan

## Executive Summary

**Decision: REFACTOR existing codebase** - The iOS app is well-architected and production-ready. We'll build a new OpenAI Assistant backend while keeping 95% of the iOS code.

**Timeline:** 2-3 weeks for complete migration + curriculum system

---

## Current State Analysis

### ✅ What We Have (Excellent Foundation)

**iOS App (Production-Ready):**
- 22 Swift files with clean architecture
- 80+ phonics patterns detected per word
- Adaptive word selection (3 strategies)
- 1,190 words + 3,570 professional audio files
- Pattern reinforcement UI with multiple choice
- Session tracking and progress analytics
- Agent-integrated with local fallback

**Agent Backend (Working, but needs migration):**
- Express API on Railway
- Claude Sonnet 4.5 integration
- File-based session persistence
- 2 endpoints: question generation, session analysis

**Data Assets:**
- Comprehensive word database with metadata
- Pattern detection already running
- Difficulty scores calculated
- Audio library complete

### ❌ What We Need to Build

1. **Pattern Knowledge Base** - Deep phonics intelligence with sound variations
2. **Curriculum Structure** - Yearly goals, units, session plans
3. **OpenAI Assistant Backend** - Replace Claude with Assistants API
4. **Game Templates** - 3-4 core interaction types
5. **Flexible Feedback System** - Contextual, personal responses

---

## Architecture Decision

### NEW: Agentic Education Platform

```
┌─────────────────────────────────────────────────────────────┐
│  iOS App (Spellbound)                                       │
│  ✅ Keep: All models, services, views, UI                  │
│  🔄 Update: AgentService.swift (base URL + response types) │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Agent Server (Node.js + TypeScript on Railway)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Pattern Knowledge Base (NEW)                         │ │
│  │  - 80+ patterns with sound variations                 │ │
│  │  - ea → [ee 70%, eh 25%, ay 5%]                       │ │
│  │  - eau → [oh 100%] (French loanwords)                 │ │
│  │  - Teaching sequences (common first, exceptions last) │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Curriculum Engine (NEW)                              │ │
│  │  - Grade-level yearly objectives                      │ │
│  │  - 36 units (weekly themes)                           │ │
│  │  - Per-session lesson plans                           │ │
│  │  - Adaptive pacing based on student progress          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  OpenAI Assistant (NEW)                               │ │
│  │  - Coach Spark persona                                │ │
│  │  - Thread-based session memory                        │ │
│  │  - Tools: show_question, check_spelling, etc.         │ │
│  │  - Decision engine: when to reinforce vs move on      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Game Template System (NEW)                           │ │
│  │  1. Listen & Spell (classic)                          │ │
│  │  2. Pattern Detective (creative)                      │ │
│  │  3. Multiple Choice (reinforcement)                   │ │
│  │  4. Word Builder (optional - kinesthetic)             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Express API Endpoints                                │ │
│  │  POST /api/start-session                              │ │
│  │  POST /api/check-answer                               │ │
│  │  POST /api/next-activity (agent decides template)     │ │
│  │  POST /api/end-session                                │ │
│  │  GET  /api/curriculum-progress                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Pattern Knowledge Base (Week 1, Days 1-2)

**Goal:** Build deep phonics intelligence with sound variations

**Files to Create:**
- `src/patterns/patternKnowledge.ts` - Pattern database
- `src/patterns/patternIntelligence.ts` - Smart pattern lookup
- `src/patterns/types.ts` - TypeScript interfaces

**Pattern Knowledge Structure:**

```typescript
interface PatternKnowledge {
  pattern: "ea";
  type: "vowel_team";
  sounds: [
    {
      pronunciation: "long 'e' (ee)";
      frequency: 70;
      examples: ["beach", "teach", "dream", "team", "sea"];
      teachingNote: "This is the most common 'ea' sound";
      gradeLevel: [1, 2];
    },
    {
      pronunciation: "short 'e' (eh)";
      frequency: 25;
      examples: ["bread", "head", "ready", "heavy"];
      teachingNote: "Less common, but important words";
      gradeLevel: [2, 3];
    },
    {
      pronunciation: "long 'a' (ay)";
      frequency: 5;
      examples: ["break", "great", "steak"];
      teachingNote: "Rare exception - memorize these";
      gradeLevel: [3, 4];
    }
  ];
  relatedPatterns: [
    {
      pattern: "eau";
      pronunciation: "long 'o' (oh)";
      origin: "French loanwords";
      examples: ["beautiful", "bureau", "plateau"];
      teachingNote: "This is different from 'ea' - 3 letters, French origin";
      gradeLevel: [4, 5];
    }
  ];
  teachingSequence: [
    { session: 1, focus: "Introduce 'ea' → 'ee'", words: ["beach", "teach"] },
    { session: 2, focus: "Reinforce 'ea' → 'ee'", words: ["dream", "team"] },
    { session: 3, focus: "Introduce 'ea' → 'eh'", words: ["bread", "head"] },
    { session: 4, focus: "Contrast sounds", words: ["beach vs bread"] },
    { session: 5, focus: "Exceptions", words: ["beautiful", "break"] }
  ];
}
```

**Deliverables:**
- ✅ 80+ patterns mapped with sound variations
- ✅ Frequency data for each sound
- ✅ Teaching sequences (common → exceptions)
- ✅ Grade-appropriate progressions

---

### Phase 2: Curriculum Structure (Week 1, Days 3-4)

**Goal:** Define yearly objectives, units, and session plans

**Files to Create:**
- `src/curriculum/yearlyPlan.ts` - Grade-level objectives
- `src/curriculum/units.ts` - 36 weekly units
- `src/curriculum/sessionPlans.ts` - Detailed lesson plans
- `src/curriculum/curriculumEngine.ts` - Progress tracking logic

**Curriculum Structure:**

```typescript
interface YearlyCurriculum {
  grade: 2;
  objectives: [
    "Master 200 high-frequency words",
    "Learn 15 common vowel teams (ea, ee, ai, ay, oa, ow, ou, oi, oy, etc.)",
    "Understand 10 basic suffixes (-ing, -ed, -er, -est, -ly, etc.)",
    "Build pattern recognition skills"
  ];
  units: Unit[36]; // One per week
}

interface Unit {
  unitNumber: 12;
  name: "Vowel Teams: 'ea' and 'ee'";
  duration: "6 sessions (2 weeks)";
  prerequisite: {
    patterns: ["Short vowels", "CVC words"];
    masteryRequired: 0.8; // 80% accuracy
  };
  learningGoals: [
    "Distinguish 'ea' → 'ee' sound (70% frequency)",
    "Spell 15 common 'ea' words automatically",
    "Understand 'ea' → 'eh' variation (bread, head)",
    "Recognize French 'eau' pattern (beautiful)"
  ];
  sessionPlans: SessionPlan[6];
  assessment: {
    masteryThreshold: 0.85; // 85% accuracy
    minSessionsRequired: 6;
    exitCriteria: "Can generate own 'ea' word examples";
  };
}

interface SessionPlan {
  sessionNumber: 1;
  lessonPlan: {
    focus: "Introduction to 'ea' vowel team";
    targetPatterns: [{
      pattern: "ea",
      sound: "long 'e'",
      examples: ["beach", "teach", "reach", "peach", "dream"]
    }];
    vocabularyGoals: string[5]; // 5 new words this session
    activities: [
      { template: "listenAndSpell", count: 10, difficulty: "easy" },
      { template: "patternDetective", count: 3, prompt: "Think of 'ea' word" },
      { template: "multipleChoice", count: 2, reinforcement: true }
    ];
    exitCriteria: {
      minimumCorrect: 12; // out of 15 words
      patternMastery: 0.8; // 80% on 'ea' pattern
    };
  };
  adaptiveBranching: {
    ifStruggling: {
      action: "Slow down, add review words";
      nextSession: "Repeat session with easier words";
    };
    ifMastering: {
      action: "Challenge with variations";
      nextSession: "Introduce 'ea' → 'eh' sound";
    };
  };
}
```

**Deliverables:**
- ✅ Grade 1-5 yearly curricula
- ✅ 36 units per grade (180 units total)
- ✅ 6 session plans per unit
- ✅ Adaptive branching logic

---

### Phase 3: OpenAI Assistant Setup (Week 1, Days 5-7)

**Goal:** Create intelligent agent with curriculum awareness

**Files to Create:**
- `src/assistant/assistantSetup.ts` - Create/configure assistant
- `src/assistant/threadManager.ts` - Session thread management
- `src/assistant/tools.ts` - Tool definitions
- `src/assistant/prompts.ts` - System prompt builder

**Assistant Configuration:**

```typescript
const assistant = await openai.beta.assistants.create({
  name: "Coach Spark",
  instructions: buildSystemPrompt({
    persona: coachSparkPersona,
    currentUnit: "Vowel Teams: ea & ee",
    sessionNumber: 3,
    studentProfile: {
      name: "Emma",
      grade: 2,
      masteredPatterns: ["short vowels", "CVC", "sh", "ch"],
      strugglingPatterns: ["ea variations"],
      interests: ["pirates", "dinosaurs", "space"]
    }
  }),
  model: "gpt-4o",
  tools: [
    {
      type: "function",
      function: {
        name: "show_question",
        description: "Display a question to the student using a game template",
        parameters: {
          type: "object",
          properties: {
            template: {
              type: "string",
              enum: ["listenAndSpell", "patternDetective", "multipleChoice", "wordBuilder"]
            },
            data: {
              type: "object",
              properties: {
                word: { type: "string" },
                pattern: { type: "string" },
                options: { type: "array" },
                prompt: { type: "string" }
              }
            },
            feedback: {
              type: "object",
              properties: {
                message: { type: "string" },
                tone: { type: "string", enum: ["celebratory", "encouraging", "gentle", "playful"] },
                relatedExamples: { type: "array" },
                personalNote: { type: "string" }
              }
            }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "check_spelling",
        description: "Verify if student spelled the word correctly",
        parameters: {
          type: "object",
          properties: {
            word: { type: "string" },
            userAttempt: { type: "string" }
          },
          required: ["word", "userAttempt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "update_progress",
        description: "Update student's pattern mastery and curriculum progress",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            masteryLevel: { type: "number", minimum: 0, maximum: 1 },
            sessionComplete: { type: "boolean" }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_similar_words",
        description: "Find words with the same phonics pattern",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            sound: { type: "string" },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "advance_curriculum",
        description: "Move to next session or unit if student has mastered current content",
        parameters: {
          type: "object",
          properties: {
            reason: { type: "string" },
            nextFocus: { type: "string" }
          }
        }
      }
    }
  ]
});
```

**Thread Management:**

```typescript
// Session state stored in OpenAI thread metadata
interface ThreadMetadata {
  studentId: string;
  grade: number;
  currentUnit: number;
  currentSession: number;
  totalSessions: number;
  patterns: {
    mastered: string[];
    practicing: string[];
    struggling: string[];
  };
  interests: string[];
  lastActivity: string; // ISO timestamp
}

// Create or resume thread
async function getOrCreateThread(studentId: string): Promise<Thread> {
  const existingThreadId = await storage.getThreadId(studentId);

  if (existingThreadId) {
    return await openai.beta.threads.retrieve(existingThreadId);
  }

  const thread = await openai.beta.threads.create({
    metadata: {
      studentId,
      grade: 2,
      currentUnit: 1,
      currentSession: 1,
      // ... rest of metadata
    }
  });

  await storage.saveThreadId(studentId, thread.id);
  return thread;
}
```

**Deliverables:**
- ✅ OpenAI Assistant created with Coach Spark persona
- ✅ 5 tool functions defined
- ✅ Thread-based session management
- ✅ System prompt builder with curriculum context

---

### Phase 4: Game Templates & Backend (Week 2, Days 1-3)

**Goal:** Define templates and build agent endpoints

**Files to Create:**
- `src/templates/types.ts` - Template interfaces
- `src/templates/generators.ts` - Template data generators
- `src/agent/agentController.ts` - Main agent logic
- `src/server.ts` (refactor) - New endpoints

**Game Templates:**

```typescript
type GameTemplate =
  | { type: "listenAndSpell"; data: ListenAndSpellData }
  | { type: "patternDetective"; data: PatternDetectiveData }
  | { type: "multipleChoice"; data: MultipleChoiceData }
  | { type: "wordBuilder"; data: WordBuilderData };

interface ListenAndSpellData {
  word: string;
  hint?: string;
  playAudio: boolean;
}

interface PatternDetectiveData {
  pattern: string;
  sound: string;
  prompt: string;
  examplesHidden: string[]; // Show after submit
  difficulty: "easy" | "medium" | "hard";
}

interface MultipleChoiceData {
  question: string;
  options: string[4];
  correctIndex: number;
  explanation: string;
  pattern: string;
}

interface WordBuilderData {
  word: string;
  scrambledLetters: string[];
  hint?: string;
}

// Agent response includes template + feedback
interface AgentResponse {
  action: "show_question" | "provide_feedback" | "end_session";
  template?: GameTemplate;
  feedback: {
    message: string;
    tone: "celebratory" | "encouraging" | "gentle" | "playful";
    relatedExamples?: string[];
    personalNote?: string;
  };
  progress?: {
    sessionWordsComplete: number;
    sessionWordsTotal: number;
    currentUnit: string;
    masteryLevel: number;
  };
}
```

**New API Endpoints:**

```typescript
// 1. Start new practice session
POST /api/start-session
{
  studentId: string;
  grade?: number; // If new student
}
→ Response: {
  threadId: string;
  sessionPlan: {
    unit: string;
    focus: string;
    wordsTotal: 15;
  };
  firstActivity: AgentResponse;
}

// 2. Submit student answer
POST /api/check-answer
{
  threadId: string;
  answer: {
    word: string;
    userAttempt: string;
    template: "listenAndSpell" | "patternDetective" | etc.
  }
}
→ Response: {
  correct: boolean;
  feedback: string;
  incorrectPatterns?: string[];
  nextActivity: AgentResponse; // Agent decides what's next
}

// 3. Request next activity (agent-driven)
POST /api/next-activity
{
  threadId: string;
  context?: {
    studentSeemsStruggling: boolean;
    studentAskedQuestion: string;
  }
}
→ Response: AgentResponse

// 4. End session
POST /api/end-session
{
  threadId: string;
}
→ Response: {
  sessionSummary: {
    wordsCorrect: number;
    wordsTotal: number;
    patternsReinforced: string[];
    gemsEarned: number;
  };
  curriculumProgress: {
    currentUnit: string;
    percentComplete: number;
    readyForNextUnit: boolean;
  };
  coachMessage: string;
}

// 5. Get curriculum progress
GET /api/curriculum-progress/:studentId
→ Response: {
  grade: number;
  currentUnit: number;
  unitsTotal: 36;
  masteredPatterns: string[];
  strugglingPatterns: string[];
  totalWordsLearned: number;
}
```

**Agent Decision Engine:**

```typescript
async function decideNextActivity(
  thread: Thread,
  lastAnswer: Answer,
  patternKnowledge: PatternKnowledgeBase,
  curriculum: CurriculumEngine
): Promise<AgentResponse> {

  // 1. Get current curriculum state
  const currentUnit = curriculum.getUnit(thread.metadata.currentUnit);
  const sessionPlan = currentUnit.sessionPlans[thread.metadata.currentSession];

  // 2. Analyze student performance
  const recentAccuracy = calculateRecentAccuracy(thread, lastAnswers: 5);
  const patternMastery = getPatternMastery(thread, lastAnswer.pattern);

  // 3. Agent makes decision
  if (lastAnswer.incorrect && patternMastery < 0.7) {
    // Student struggling with pattern - reinforce
    return {
      action: "show_question",
      template: {
        type: "multipleChoice",
        data: generateMultipleChoice(lastAnswer.pattern, patternKnowledge)
      },
      feedback: {
        message: `Let's practice that '${lastAnswer.pattern}' pattern a bit more!`,
        tone: "encouraging",
        relatedExamples: patternKnowledge.getExamples(lastAnswer.pattern, 3)
      }
    };
  }

  if (lastAnswer.correct && patternMastery > 0.85) {
    // Student has mastered - challenge them
    return {
      action: "show_question",
      template: {
        type: "patternDetective",
        data: {
          pattern: lastAnswer.pattern,
          prompt: `You're nailing '${lastAnswer.pattern}'! Can you think of your OWN word?`
        }
      },
      feedback: {
        message: "You're on fire! Let's see if you can challenge yourself.",
        tone: "celebratory"
      }
    };
  }

  // Default: Continue with next word in session plan
  const nextWord = sessionPlan.vocabularyGoals[thread.metadata.wordIndex + 1];
  return {
    action: "show_question",
    template: {
      type: "listenAndSpell",
      data: { word: nextWord, playAudio: true }
    },
    feedback: {
      message: pickEncouragingMessage(lastAnswer.correct),
      tone: lastAnswer.correct ? "celebratory" : "gentle"
    }
  };
}
```

**Deliverables:**
- ✅ 4 game templates defined
- ✅ 5 new API endpoints
- ✅ Agent decision engine
- ✅ Template generators

---

### Phase 5: iOS Integration (Week 2, Days 4-5)

**Goal:** Update iOS app to use new agentic backend

**Files to Modify:**
1. `AgentService.swift` - Update for new endpoints
2. `PracticeViewModel.swift` - Simplify (agent now controls flow)
3. Add new template views if needed

**AgentService.swift Changes:**

```swift
class AgentService {
    private let baseURL = "https://spellbound-production.up.railway.app"

    // NEW: Start session with agent
    func startSession(studentId: String, grade: Int?) async throws -> SessionStartResponse {
        let url = URL(string: "\(baseURL)/api/start-session")!
        // ... implementation
    }

    // NEW: Check answer and get next activity
    func checkAnswer(
        threadId: String,
        word: String,
        userAttempt: String,
        template: String
    ) async throws -> CheckAnswerResponse {
        let url = URL(string: "\(baseURL)/api/check-answer")!
        // ... implementation
    }

    // KEEP: For offline fallback
    func generatePatternQuestion(...) async throws -> AgentQuestionResponse {
        // ... existing code
    }
}
```

**PracticeViewModel.swift Simplification:**

```swift
class PracticeViewModel: ObservableObject {
    // REMOVE: Hardcoded session flow
    // ADD: Agent-driven flow

    @Published var currentActivity: AgentResponse?
    @Published var threadId: String?

    func startSession() async {
        do {
            let response = try await agentService.startSession(
                studentId: storageService.studentId,
                grade: 2
            )

            self.threadId = response.threadId
            self.currentActivity = response.firstActivity

            // Display activity based on template
            handleActivity(currentActivity)

        } catch {
            // Fallback to local mode
            useLocalMode()
        }
    }

    func checkAnswer() async {
        guard let word = currentWord, let threadId = threadId else { return }

        let response = try await agentService.checkAnswer(
            threadId: threadId,
            word: word.text,
            userAttempt: userInput,
            template: currentTemplate
        )

        isCorrect = response.correct
        showFeedback = true

        // Agent decides what's next!
        currentActivity = response.nextActivity
    }

    func handleActivity(_ activity: AgentResponse) {
        switch activity.template?.type {
        case "listenAndSpell":
            // Show listen & spell UI
        case "patternDetective":
            // Show pattern detective UI
        case "multipleChoice":
            // Show multiple choice UI
        case "wordBuilder":
            // Show word builder UI
        default:
            break
        }
    }
}
```

**Deliverables:**
- ✅ AgentService updated for new endpoints
- ✅ PracticeViewModel simplified (agent controls flow)
- ✅ Offline fallback preserved
- ✅ New template views (if needed)

---

### Phase 6: Testing & Deployment (Week 3)

**Goal:** End-to-end testing and production deployment

**Testing Checklist:**

- [ ] Pattern knowledge lookup (ea → ee vs ea → eh)
- [ ] Curriculum progression (Unit 1 → Unit 2)
- [ ] Agent decision engine (reinforce vs challenge)
- [ ] All 4 game templates render correctly
- [ ] Offline fallback works
- [ ] Session persistence across app restarts
- [ ] Progress tracking accurate
- [ ] Gem rewards working
- [ ] Audio playback (3,570 files)
- [ ] Pattern tips show correctly
- [ ] Multiple users (if supported)

**Deployment:**

1. Deploy new agent backend to Railway
2. Set environment variables:
   - `OPENAI_API_KEY` (already set)
   - `NODE_ENV=production`
   - `PORT=3000`
3. Update iOS app AgentService base URL
4. Test in production
5. Monitor OpenAI costs

**Deliverables:**
- ✅ All tests passing
- ✅ Production deployment live
- ✅ Monitoring set up
- ✅ Cost tracking enabled

---

## Cost Estimates

### OpenAI Assistants API Pricing

**Model: GPT-4o (Recommended)**
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

**Per Session Estimate:**
- System prompt + curriculum: ~1,500 tokens (input)
- 15 words × avg 3 interactions each: ~45 tool calls
- Agent responses: ~200 tokens × 45 = 9,000 tokens (output)
- **Total: ~1,500 input + 9,000 output = $0.10 per session**

**Monthly Cost (100 active students × 12 sessions/month):**
- 1,200 sessions × $0.10 = **$120/month**

**Optimization:**
- Cache system prompt (reduce input tokens by 50%)
- Use GPT-4o-mini for simple interactions ($0.15/$0.60 per 1M tokens)
- Estimated optimized cost: **$40-60/month** for 100 students

---

## Migration Risks & Mitigation

### Risk 1: OpenAI API Latency
- **Mitigation:** Keep local fallback, use streaming responses
- **Fallback:** iOS app already has offline mode

### Risk 2: Cost Overruns
- **Mitigation:** Set OpenAI spending limits, monitor usage
- **Optimization:** Use GPT-4o-mini where possible

### Risk 3: Session State Loss
- **Mitigation:** Persist thread IDs locally, backup to file system
- **Recovery:** Rebuild from session history if thread lost

### Risk 4: iOS App Breaking Changes
- **Mitigation:** Keep existing UI, only change AgentService
- **Rollback:** Can revert to Claude backend if needed

### Risk 5: Curriculum Doesn't Match Student Level
- **Mitigation:** Start with diagnostic assessment, allow parent override
- **Adaptation:** Agent can skip ahead or review based on performance

---

## Success Metrics

### Phase 1-3 (Backend)
- ✅ Pattern knowledge covers 80+ patterns
- ✅ Curriculum has 180 session plans (36 weeks × 5 grades)
- ✅ OpenAI Assistant responds in <2s

### Phase 4-5 (Integration)
- ✅ iOS app builds without errors
- ✅ All 4 templates render correctly
- ✅ Agent makes sensible decisions (manual QA)

### Phase 6 (Production)
- ✅ 95%+ uptime
- ✅ <$100/month for 100 students
- ✅ Student engagement improved (session length, frequency)
- ✅ Pattern mastery improves (before/after metrics)

---

## Next Steps

1. ✅ Review and approve this plan
2. ⏳ Build Pattern Knowledge Base (2 days)
3. ⏳ Build Curriculum Structure (2 days)
4. ⏳ Set up OpenAI Assistant (3 days)
5. ⏳ Build Templates & Backend (3 days)
6. ⏳ Update iOS App (2 days)
7. ⏳ Test & Deploy (1 week)

**Total Timeline: 2-3 weeks**

---

## Questions for Consideration

1. **Grade Level:** Should we start with Grade 2 curriculum only, or build all 5 grades?
2. **Diagnostic:** Do new students take a placement test to find their level?
3. **Parent Dashboard:** Do parents need web access to see progress?
4. **Voice Input:** Should we add STT (speech-to-text) for spelling?
5. **Multi-User:** Do we need user accounts and authentication?

Let me know which phase to start with!
