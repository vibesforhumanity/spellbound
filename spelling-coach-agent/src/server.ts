import express from "express";
import cors from "cors";
import { generatePatternQuestion, analyzePracticeSession } from "./agent.js";

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Log startup info
console.log(`🔧 Node environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);
console.log(`🔧 Using Anthropic SDK v0.32.0`);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "spelling-coach-agent" });
});

/**
 * POST /api/generate-question
 * Generate a multiple choice question for pattern reinforcement
 *
 * Request body:
 * {
 *   sessionId: string
 *   incorrectWord: string
 *   userAttempt: string
 *   pattern: string
 *   previousAttempts?: number
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   question?: {
 *     question: string
 *     options: string[]
 *     correctAnswer: string
 *     explanation: string
 *   }
 *   error?: string
 * }
 */
app.post("/api/generate-question", async (req, res) => {
  try {
    const { sessionId, incorrectWord, userAttempt, pattern, previousAttempts = 0 } = req.body;

    // Validate required fields
    if (!sessionId || !incorrectWord || !userAttempt || !pattern) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sessionId, incorrectWord, userAttempt, pattern",
      });
    }

    console.log(`\n📝 Generating question for pattern: ${pattern}`);
    console.log(`   Word: "${incorrectWord}" | User attempt: "${userAttempt}"`);
    console.log(`   Attempt: ${previousAttempts + 1}/3`);

    // Call the agent to generate question
    const result = await generatePatternQuestion(
      sessionId,
      incorrectWord,
      userAttempt,
      pattern,
      previousAttempts
    );

    if (result.success) {
      console.log(`✅ Question generated successfully`);
      res.json(result);
    } else {
      console.error(`❌ Failed to generate question: ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/analyze-session
 * Analyze a practice session and provide coaching feedback
 *
 * Request body:
 * {
 *   sessionId: string
 *   practiceResults: {
 *     correctWords: string[]
 *     incorrectWords: string[]
 *     masteredPatterns: string[]
 *     challengingPatterns: string[]
 *     missedWordsByPattern: Record<string, string[]>
 *   }
 *   studentQuestion?: string
 * }
 *
 * Response:
 * {
 *   sessionContext: SessionContext
 *   response: string
 * }
 */
app.post("/api/analyze-session", async (req, res) => {
  try {
    const { sessionId, practiceResults, studentQuestion } = req.body;

    // Validate required fields
    if (!sessionId || !practiceResults) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: sessionId, practiceResults",
      });
    }

    console.log(`\n📊 Analyzing practice session: ${sessionId}`);
    console.log(`   Correct: ${practiceResults.correctWords?.length || 0}`);
    console.log(`   Incorrect: ${practiceResults.incorrectWords?.length || 0}`);

    // Call the agent to analyze session
    const result = await analyzePracticeSession(
      sessionId,
      practiceResults,
      studentQuestion
    );

    console.log(`✅ Session analyzed successfully`);
    res.json(result);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎓 Spelling Coach Agent API running on port ${PORT}`);
  console.log(`   Health check: /health`);
  console.log(`   Generate question: POST /api/generate-question`);
  console.log(`   Analyze session: POST /api/analyze-session`);
  console.log(`\n⚡ Using Claude Agent SDK with model: claude-sonnet-4-5-20250929\n`);
});
