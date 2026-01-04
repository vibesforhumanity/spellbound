import Anthropic from "@anthropic-ai/sdk";
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
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `spelling-${timestamp}-${random}`;
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

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SPELLING_COACH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: questionPrompt,
        },
      ],
    });

    const response = message.content[0].type === "text" ? message.content[0].text : "";

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
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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
  const sessionContextMessage = buildSessionContextMessage(sessionContext);
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

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: `${SPELLING_COACH_SYSTEM_PROMPT}\n\n${sessionContextMessage}`,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    const response = message.content[0].type === "text" ? message.content[0].text : "";

    // Update session notes
    sessionContext.notes.push(`[${new Date().toISOString()}] ${analysisPrompt.substring(0, 100)}...`);
    await saveSession(sessionContext);

    return {
      sessionContext,
      response,
    };
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}

export default {
  generatePatternQuestion,
  analyzePracticeSession,
};
