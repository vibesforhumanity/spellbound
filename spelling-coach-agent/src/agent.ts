import { query } from "@anthropic-ai/claude-agent-sdk";
import SPELLING_COACH_SYSTEM_PROMPT from "./systemPrompt.js";
import {
  loadSession,
  saveSession,
  createSessionContext,
  buildSessionContextMessage,
  type SessionContext,
} from "./sessionManager.js";

interface AgentOptions {
  sessionId?: string;
  model?: string;
  allowedTools?: string[];
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `spelling-${timestamp}-${random}`;
}

/**
 * Initialize and run the spelling coach agent
 *
 * This function is designed to be model-agnostic. For migration to Kimi K2:
 * 1. Replace the `query` import with your Kimi K2 client
 * 2. Update the model parameter handling
 * 3. Adjust the message streaming logic to match Kimi K2's API
 * 4. Keep the session management and system prompt logic unchanged
 */
export async function runSpellingCoachAgent(
  userPrompt: string,
  options: AgentOptions = {}
) {
  const {
    sessionId = generateSessionId(),
    model = "claude-sonnet-4-5-20250929", // Using Sonnet 4.5 for cost efficiency
    allowedTools = ["Read", "WebSearch"],
  } = options;

  // Load or create session context
  let sessionContext = await loadSession(sessionId);
  if (!sessionContext) {
    sessionContext = createSessionContext(sessionId);
  }

  // Build the complete system prompt with session context
  const sessionContextMessage = buildSessionContextMessage(sessionContext);
  const systemPrompt = `${SPELLING_COACH_SYSTEM_PROMPT}\n\n${sessionContextMessage}`;

  console.log(`\n🎓 Starting spelling coach session: ${sessionId}`);
  console.log(`🤖 Model: ${model}\n`);

  let newSessionId: string | null = null;
  let fullResponse = "";

  // Stream the agent response
  for await (const message of query({
    prompt: userPrompt,
    options: {
      model,
      systemPrompt,
      allowedTools,
      permissionMode: "acceptEdits",
    },
  })) {
    // Capture the session ID from the system init message
    if (message.type === "system" && message.subtype === "init") {
      newSessionId = message.session_id;
      console.log(`[System] Session initialized: ${newSessionId}`);
    }

    // Log assistant responses
    if (message.type === "assistant" && message.message?.content) {
      for (const block of message.message.content) {
        if ("text" in block) {
          console.log(`\n[Coach Spark] ${block.text}`);
          fullResponse += block.text + "\n";
        } else if ("name" in block) {
          console.log(`[Tool] Using: ${block.name}`);
        }
      }
    }

    // Log results
    if (message.type === "result") {
      console.log(`\n[Result] Session complete`);
      console.log(`⏱️  Duration: ${message.duration_ms}ms`);
      console.log(`💰 Cost: $${message.total_cost_usd.toFixed(6)}`);

      if (message.is_error) {
        console.error(`[Error] Session failed`);
      }
    }
  }

  // Update and save session context
  if (newSessionId) {
    sessionContext.sessionId = newSessionId;
  }

  // Add response to notes
  if (fullResponse.trim()) {
    sessionContext.notes.push(`[${new Date().toISOString()}] ${userPrompt.substring(0, 100)}...`);
  }

  await saveSession(sessionContext);

  return {
    sessionContext,
    response: fullResponse,
  };
}

/**
 * Resume a previous session with the coach
 */
export async function resumeSpellingCoachSession(
  sessionId: string,
  userPrompt: string,
  model = "claude-sonnet-4-5-20250929"
) {
  // Load session context
  const sessionContext = await loadSession(sessionId);
  if (!sessionContext) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const sessionContextMessage = buildSessionContextMessage(sessionContext);
  const systemPrompt = `${SPELLING_COACH_SYSTEM_PROMPT}\n\n${sessionContextMessage}`;

  console.log(`\n🔄 Resuming spelling coach session: ${sessionId}`);
  console.log(`👤 Student: ${sessionContext.studentName || "Unknown"}\n`);

  // Continue conversation
  return runSpellingCoachAgent(userPrompt, {
    sessionId,
    model,
  });
}

/**
 * Analyze a practice session and provide coaching feedback
 *
 * This is the main integration point with the Spellbound iOS app.
 * The app will send session results and get personalized coaching feedback.
 */
export async function analyzePracticeSession(
  sessionId: string,
  practiceResults: {
    correctWords: string[];
    incorrectWords: string[];
    masteredPatterns: string[];
    challengingPatterns: string[];
    missedWordsByPattern: Record<string, string[]>;
  },
  studentQuestion?: string
) {
  // Load or create session context
  let sessionContext = await loadSession(sessionId);
  if (!sessionContext) {
    sessionContext = createSessionContext(sessionId);
  }

  // Update session with practice results
  for (const word of practiceResults.correctWords) {
    if (!sessionContext.masteredWords.includes(word)) {
      sessionContext.masteredWords.push(word);
    }
    sessionContext.strugglingWords = sessionContext.strugglingWords.filter((w) => w !== word);
  }

  for (const word of practiceResults.incorrectWords) {
    if (!sessionContext.strugglingWords.includes(word)) {
      sessionContext.strugglingWords.push(word);
    }
  }

  for (const pattern of practiceResults.masteredPatterns) {
    if (!sessionContext.masteredPatterns.includes(pattern)) {
      sessionContext.masteredPatterns.push(pattern);
    }
    sessionContext.strugglingPatterns = sessionContext.strugglingPatterns.filter((p) => p !== pattern);
  }

  for (const pattern of practiceResults.challengingPatterns) {
    if (!sessionContext.strugglingPatterns.includes(pattern)) {
      sessionContext.strugglingPatterns.push(pattern);
    }
  }

  await saveSession(sessionContext);

  // Build prompt for coach analysis
  const analysisPrompt = `
Hi Coach Spark! I just finished a practice session. Here's how I did:

**Words I spelled correctly:** ${practiceResults.correctWords.join(", ") || "None"}

**Words I struggled with:** ${practiceResults.incorrectWords.join(", ") || "None"}

**Patterns I mastered:** ${practiceResults.masteredPatterns.join(", ") || "None"}

**Patterns I need help with:** ${practiceResults.challengingPatterns.join(", ") || "None"}

${Object.entries(practiceResults.missedWordsByPattern).map(([pattern, words]) =>
  `- **${pattern}**: Missed words: ${words.join(", ")}`
).join("\n")}

${studentQuestion ? `\nI also have a question: ${studentQuestion}` : ""}

Can you help me understand what I should focus on and give me some tips?
`;

  return runSpellingCoachAgent(analysisPrompt, { sessionId });
}

/**
 * Generate a multiple choice question for pattern reinforcement
 *
 * Used when student struggles with a pattern - generates adaptive questions
 * until pattern is mastered (max 3 attempts)
 */
export async function generatePatternQuestion(
  sessionId: string,
  incorrectWord: string,
  userAttempt: string,
  pattern: string,
  previousAttempts: number = 0
) {
  const questionPrompt = `
The student just misspelled "${incorrectWord}" as "${userAttempt}". They're struggling with the "${pattern}" pattern.

${previousAttempts > 0 ? `This is attempt ${previousAttempts + 1} of 3 to master this pattern.` : ""}

Generate a multiple choice question to help them practice identifying the correct spelling of words with the "${pattern}" pattern.

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting, no code blocks. Just the raw JSON object.

{
  "question": "Which word is spelled INCORRECTLY?",
  "options": ["a) [correct word]", "b) [correct word]", "c) [misspelled word]", "d) [correct word]"],
  "correctAnswer": "c) [misspelled word]",
  "explanation": "Brief, kid-friendly explanation of the pattern and why the incorrect option is wrong"
}

Requirements:
- Include 3 correctly spelled words and 1 incorrectly spelled word
- The incorrect option should use common misspelling patterns (like 'shun' instead of 'tion', 'ea' vs 'ee', etc.)
- Keep it age-appropriate for elementary students
- Make it clear and simple
- The explanation should be 1-2 sentences maximum
`;

  const { response } = await runSpellingCoachAgent(questionPrompt, { sessionId });

  // Try to extract JSON from response
  try {
    // Remove markdown code blocks if present
    let cleanResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Find JSON object
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const question = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (
        question.question &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.correctAnswer &&
        question.explanation
      ) {
        return {
          success: true,
          question,
        };
      }
    }

    throw new Error("Invalid question format");
  } catch (error) {
    console.error("Failed to parse question:", error);
    return {
      success: false,
      error: "Failed to generate question",
      rawResponse: response,
    };
  }
}

export default {
  runSpellingCoachAgent,
  resumeSpellingCoachSession,
  analyzePracticeSession,
  generatePatternQuestion,
};
