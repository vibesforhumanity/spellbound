/**
 * Coach Spark Client - Responses API Implementation
 *
 * Uses OpenAI's Responses API (Chat Completions with function calling)
 * instead of the deprecated Assistants API.
 */

import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { curriculumEngine } from "../curriculum/index.js";
import { handleToolCall } from "./toolHandlers.js";
import { loadProgress, saveProgress } from "./threadManager.js";
import type { CurriculumProgress } from "../curriculum/types.js";

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  return new OpenAI({ apiKey });
}

/**
 * Build Coach Spark system prompt with curriculum context
 */
function buildSystemPrompt(grade: number, progress?: CurriculumProgress): string {
  let prompt = `# You are Coach Spark 🎓

An enthusiastic, patient, and intelligent spelling coach for elementary school children (ages 6-11).

## Core Identity

You are an expert in:
- **Etymology & Word Origins**: You know the fascinating history behind words
- **Educational Psychology**: You understand how children learn
- **Linguistics & Phonics**: Deep knowledge of 70+ phonics patterns

## Personality

- **Encouraging**: Celebrate every success
- **Patient**: Mistakes are learning opportunities
- **Playful**: Use fun examples and connections
- **Clear**: Age-appropriate explanations

## Current Student

- **Grade Level**: ${grade}`;

  if (progress) {
    prompt += `
- **Current Unit**: Unit ${progress.currentUnit}, Session ${progress.currentSession}
- **Sessions Completed**: ${progress.totalSessionsCompleted}
- **Words Learned**: ${progress.wordsLearned.length}
- **Patterns Tracked**: ${Object.keys(progress.patternMastery).length}`;
  }

  prompt += `

## Your Tools

You have access to these tools to help teach spelling:

1. **show_question**: Display a game template (Listen & Spell, Multiple Choice, Pattern Detective, Word Builder)
2. **check_spelling**: Validate student's answer and identify pattern errors
3. **update_progress**: Save session results and update mastery levels
4. **get_similar_words**: Find practice words for specific patterns
5. **advance_curriculum**: Get next session recommendation based on performance

## Teaching Guidelines

**When Starting:**
- Greet warmly and check today's curriculum focus
- Use show_question to present first activity

**When Student Answers:**
- Use check_spelling to validate and identify errors
- If correct: Celebrate and explain the pattern
- If incorrect: Show which patterns were tricky, give tips
- Track pattern mastery

**Decision Making:**
- **Mastering (>90%)**: Skip ahead or advance to next unit
- **Struggling (<60%)**: Repeat session, focus on weakest pattern
- **Normal (60-90%)**: Continue planned sequence

**At Session End:**
- Summarize patterns practiced
- Celebrate progress
- Use update_progress to save results
- Use advance_curriculum for next session

## Communication Style

- Simple sentences for grade level
- Occasional emojis (✨, 🎉, 💡)
- Bite-sized explanations
- Connections to familiar things

Remember: You're building confidence and love of language! 🌟`;

  return prompt;
}

/**
 * Tool definitions for Coach Spark
 */
const TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "show_question",
      description: "Display a game template to the student",
      parameters: {
        type: "object",
        properties: {
          template: {
            type: "string",
            enum: ["listenAndSpell", "multipleChoice", "patternDetective", "wordBuilder"],
            description: "Question template type",
          },
          word: { type: "string", description: "Target word" },
          pattern: { type: "string", description: "Phonics pattern being practiced" },
          sound: { type: "string", description: "Specific sound variation" },
          options: { type: "array", items: { type: "string" }, description: "Multiple choice options (3-4)" },
          context: { type: "string", description: "Kid-friendly hint" },
        },
        required: ["template"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_spelling",
      description: "Validate student's spelling and identify pattern errors",
      parameters: {
        type: "object",
        properties: {
          correctWord: { type: "string", description: "Correct spelling" },
          studentAttempt: { type: "string", description: "What student typed" },
          targetPatterns: {
            type: "array",
            items: { type: "string" },
            description: "Patterns being practiced",
          },
        },
        required: ["correctWord", "studentAttempt"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_progress",
      description: "Update student's progress after session",
      parameters: {
        type: "object",
        properties: {
          correctWords: { type: "array", items: { type: "string" } },
          incorrectWords: { type: "array", items: { type: "string" } },
          patternAccuracy: {
            type: "object",
            description: "Pattern -> accuracy (0-1)",
            additionalProperties: { type: "number" },
          },
        },
        required: ["correctWords", "incorrectWords", "patternAccuracy"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_similar_words",
      description: "Get practice words for a pattern",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Phonics pattern" },
          sound: { type: "string", description: "Sound variation (optional)" },
          count: { type: "number", description: "How many words (default: 5)" },
          difficulty: { type: "number", enum: [1, 2, 3, 4, 5], description: "Difficulty level" },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "advance_curriculum",
      description: "Get next session recommendation",
      parameters: {
        type: "object",
        properties: {
          recentAccuracy: { type: "number", description: "Session accuracy (0-1)" },
          lastSessionPatterns: {
            type: "array",
            items: { type: "string" },
            description: "Patterns practiced",
          },
        },
        required: ["recentAccuracy", "lastSessionPatterns"],
      },
    },
  },
];

/**
 * Conversation history for a student session
 */
export interface ConversationHistory {
  studentId: string;
  grade: number;
  messages: ChatCompletionMessageParam[];
  progress: CurriculumProgress;
}

/**
 * Coach Spark response
 */
export interface CoachResponse {
  message: string;
  conversationHistory: ConversationHistory;
}

/**
 * Send a message to Coach Spark and handle tool calls
 */
export async function chatWithCoach(
  userMessage: string,
  conversationHistory: ConversationHistory
): Promise<CoachResponse> {
  const openai = getOpenAIClient();

  // Build system prompt with current progress
  const systemPrompt = buildSystemPrompt(conversationHistory.grade, conversationHistory.progress);

  // Add user message to history
  conversationHistory.messages.push({
    role: "user",
    content: userMessage,
  });

  // Prepare messages (system + history)
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.messages,
  ];

  // Call OpenAI with tools
  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    tools: TOOLS,
    tool_choice: "auto",
  });

  // Handle tool calls
  while (response.choices[0].finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls;

    if (!toolCalls) break;

    // Add assistant message to history
    conversationHistory.messages.push(response.choices[0].message);

    // Execute each tool call
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      console.log(`🔧 Tool call: ${functionName}`, args);

      // Handle tool call
      const result = handleToolCall(functionName, args, conversationHistory.progress);

      // Update progress if needed
      if (functionName === "update_progress" && result.success) {
        conversationHistory.progress = result.data.progress;
        await saveProgress(conversationHistory.progress);
      }

      // Add tool response to messages
      conversationHistory.messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    // Get next response
    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.messages,
      ],
      tools: TOOLS,
      tool_choice: "auto",
    });
  }

  // Add final assistant message to history
  const assistantMessage = response.choices[0].message.content || "";
  conversationHistory.messages.push({
    role: "assistant",
    content: assistantMessage,
  });

  return {
    message: assistantMessage,
    conversationHistory,
  };
}

/**
 * Start a new coaching session
 */
export async function startSession(
  studentId: string,
  grade: number,
  initialMessage?: string
): Promise<CoachResponse> {
  // Load or create progress
  let progress = await loadProgress(studentId);
  if (!progress) {
    progress = curriculumEngine.createNewProgress(studentId, grade);
    await saveProgress(progress);
  }

  // Create conversation history
  const conversationHistory: ConversationHistory = {
    studentId,
    grade,
    messages: [],
    progress,
  };

  // Send initial message
  const message =
    initialMessage ||
    "Hi Coach Spark! I'm ready to practice my spelling. What should we work on today?";

  return await chatWithCoach(message, conversationHistory);
}

/**
 * Continue an existing conversation
 */
export async function continueSession(
  conversationHistory: ConversationHistory,
  userMessage: string
): Promise<CoachResponse> {
  return await chatWithCoach(userMessage, conversationHistory);
}
