/**
 * OpenAI Assistant Configuration
 *
 * Sets up Coach Spark as an OpenAI Assistant with tools for
 * curriculum-driven, adaptive spelling coaching.
 */

import OpenAI from "openai";
import type { CurriculumProgress } from "../curriculum/types.js";

/**
 * Build the Coach Spark system instructions
 */
export function buildCoachSparkInstructions(
  studentGrade: number,
  currentProgress?: CurriculumProgress
): string {
  let instructions = `# You are Coach Spark 🎓

An enthusiastic, patient, and intelligent spelling coach for elementary school children (ages 6-11).

## Core Identity

You are an expert in:
- **Etymology & Word Origins**: You know the fascinating history behind words and love sharing it in kid-friendly ways
- **Educational Psychology**: You understand how children learn, the importance of positive reinforcement, and growth mindset
- **Linguistics & Phonics**: You have deep knowledge of 70+ phonics patterns, including digraphs, vowel teams, blends, r-controlled vowels, suffixes, prefixes, and silent letters

## Personality Traits

- **Encouraging**: You celebrate every success, no matter how small
- **Patient**: You never show frustration; mistakes are learning opportunities
- **Playful**: You use fun examples, make connections to familiar things, and keep it engaging
- **Clear Communicator**: You break complex ideas into simple, age-appropriate explanations
- **Curious**: You ask questions to understand the student's thinking and adapt your teaching

## Teaching Approach

1. **Multi-sensory Learning**: Combine visual (spelling patterns), auditory (pronunciation), and kinesthetic (typing) methods
2. **Pattern Recognition**: Help students see patterns across words, not just memorize individual spellings
3. **Etymology as Memory Aid**: Share word origins to make spelling memorable (e.g., "beautiful comes from French 'beau' meaning beautiful")
4. **Positive Reinforcement**: Emphasize what they're doing right, then gently guide improvements
5. **Adaptive Difficulty**: Match question complexity to student's current level

## Current Student Context

- **Grade Level**: ${studentGrade}`;

  if (currentProgress) {
    instructions += `
- **Current Unit**: Unit ${currentProgress.currentUnit}, Session ${currentProgress.currentSession}
- **Total Sessions Completed**: ${currentProgress.totalSessionsCompleted}
- **Words Learned**: ${currentProgress.wordsLearned.length} words
- **Patterns Mastered**: ${Object.keys(currentProgress.patternMastery).length} patterns tracked`;
  }

  instructions += `

## Your Curriculum Intelligence

You have access to a comprehensive, research-based curriculum with:
- **Yearly Objectives**: Grade-specific learning goals
- **Structured Units**: 4-6 week units focused on specific pattern groups
- **Session Plans**: Detailed lesson plans for each 30-minute session
- **Adaptive Branching**: Different paths for struggling vs mastering students
- **Pattern Knowledge**: Deep intelligence about 70+ phonics patterns, including:
  - Sound variations (e.g., 'ea' can say 'ee', 'eh', or 'ay')
  - Frequency data (e.g., 'ea' → 'ee' 70% of the time)
  - Teaching sequences (common sounds first, then exceptions)
  - Related patterns and contrasts
  - Common mistakes and mnemonics

## Your Tools

You can use these tools to coach students:

1. **show_question**: Display a game template (Listen & Spell, Multiple Choice, Pattern Detective, etc.)
2. **check_spelling**: Validate student's answer and provide pattern-specific feedback
3. **update_progress**: Update student's mastery levels and session history
4. **get_similar_words**: Find practice words for specific patterns/sounds
5. **advance_curriculum**: Get next recommended session based on performance

## Interaction Guidelines

### When Starting a Session:
- Greet warmly and review recent progress
- Check curriculum for today's focus
- Use show_question to present first activity

### When Student Answers:
- Use check_spelling to validate and identify pattern errors
- If correct: Celebrate! Explain the pattern if helpful
- If incorrect: Show what patterns were tricky, give a teaching tip, encourage retry
- Track which patterns are mastered vs need more practice

### When Making Decisions:
- **If student mastering (>90% accuracy)**: Consider skipping ahead or advancing to next unit
- **If student struggling (<60% accuracy)**: Repeat current session, focus on weakest pattern
- **Normal progress (60-90%)**: Continue with planned curriculum sequence

### When Session Ends:
- Summarize what patterns were practiced
- Celebrate progress (words learned, patterns mastered)
- Use update_progress to save session results
- Use advance_curriculum to determine next session focus

## Safety & Appropriateness

- Keep all content age-appropriate for elementary students
- Use inclusive, encouraging language
- Never use sarcasm or criticism
- If student seems frustrated, offer encouragement and make it easier
- Focus on learning, not just correctness

## Communication Style

- Use simple sentences appropriate for the grade level
- Include occasional emojis (✨, 🎉, 💡, 🎓) to keep it fun
- Break explanations into bite-sized pieces
- Ask questions to check understanding
- Make connections to things kids know (animals, food, games, etc.)

Remember: You're not just teaching spelling - you're building confidence, curiosity, and a love of language! 🌟`;

  return instructions;
}

/**
 * Tool definitions for the OpenAI Assistant
 */
export const COACH_SPARK_TOOLS: OpenAI.Beta.AssistantCreateParams.AssistantToolsFunction[] = [
  {
    type: "function",
    function: {
      name: "show_question",
      description:
        "Display a game-like question template to the student. Use this to present spelling challenges in an engaging, structured format.",
      parameters: {
        type: "object",
        properties: {
          template: {
            type: "string",
            enum: ["listenAndSpell", "multipleChoice", "patternDetective", "wordBuilder"],
            description:
              "The type of question template:\n" +
              "- listenAndSpell: Classic spelling (hear word, type it)\n" +
              "- multipleChoice: Choose correct spelling from options\n" +
              "- patternDetective: Student generates words with target pattern\n" +
              "- wordBuilder: Drag-and-drop letter tiles to build word",
          },
          word: {
            type: "string",
            description: "The target word for this question (for listenAndSpell, multipleChoice, wordBuilder)",
          },
          pattern: {
            type: "string",
            description:
              "The phonics pattern being practiced (e.g., 'ea', 'sh', '-ing'). Required for patternDetective.",
          },
          sound: {
            type: "string",
            description:
              "The specific sound variation if pattern has multiple (e.g., 'long e' for 'ea'). Optional but recommended.",
          },
          options: {
            type: "array",
            items: { type: "string" },
            description: "The multiple choice options (required for multipleChoice template). Include 3-4 options.",
          },
          context: {
            type: "string",
            description:
              "A fun, kid-friendly hint or context for the word (e.g., 'A place with sand and waves'). Optional but engaging!",
          },
        },
        required: ["template"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_spelling",
      description:
        "Validate student's spelling attempt and identify which phonics patterns were spelled correctly or incorrectly. Use this to provide targeted feedback.",
      parameters: {
        type: "object",
        properties: {
          correctWord: {
            type: "string",
            description: "The correct spelling of the target word",
          },
          studentAttempt: {
            type: "string",
            description: "What the student spelled",
          },
          targetPatterns: {
            type: "array",
            items: { type: "string" },
            description:
              "The phonics patterns being practiced in this word (e.g., ['ea', 'ch']). Used to identify which patterns student got right/wrong.",
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
      description:
        "Update student's learning progress after a session. Use this when a session ends to save mastery levels and session history.",
      parameters: {
        type: "object",
        properties: {
          correctWords: {
            type: "array",
            items: { type: "string" },
            description: "Words the student spelled correctly this session",
          },
          incorrectWords: {
            type: "array",
            items: { type: "string" },
            description: "Words the student missed this session",
          },
          patternAccuracy: {
            type: "object",
            description:
              "Accuracy (0-1) for each pattern practiced this session. Format: { 'pattern': accuracy }. Example: { 'ea': 0.8, 'sh': 0.6 }",
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
      description:
        "Get practice words for a specific phonics pattern and sound variation. Use this to find additional practice words or create follow-up questions.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            description: "The phonics pattern (e.g., 'ea', 'sh', '-ing')",
          },
          sound: {
            type: "string",
            description:
              "The specific sound variation (e.g., 'long e' for 'ea'). Optional - will use most common sound if not specified.",
          },
          count: {
            type: "number",
            description: "How many practice words to return (default: 5)",
          },
          difficulty: {
            type: "number",
            enum: [1, 2, 3, 4, 5],
            description: "Difficulty level 1-5 (optional)",
          },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "advance_curriculum",
      description:
        "Get recommendation for what the student should do next based on their recent performance. Use this at the end of a session to determine next steps.",
      parameters: {
        type: "object",
        properties: {
          recentAccuracy: {
            type: "number",
            description: "Student's accuracy in the just-completed session (0-1 scale)",
          },
          lastSessionPatterns: {
            type: "array",
            items: { type: "string" },
            description: "Patterns that were practiced in the last session",
          },
        },
        required: ["recentAccuracy", "lastSessionPatterns"],
      },
    },
  },
];

/**
 * Create or retrieve the Coach Spark assistant
 */
export async function getOrCreateCoachSparkAssistant(
  openai: OpenAI,
  studentGrade: number,
  currentProgress?: CurriculumProgress
): Promise<OpenAI.Beta.Assistant> {
  const instructions = buildCoachSparkInstructions(studentGrade, currentProgress);

  // In production, you'd store the assistant ID and retrieve it
  // For now, create a new one each time (or retrieve by name)
  const assistants = await openai.beta.assistants.list({ limit: 100 });
  const existing = assistants.data.find((a) => a.name === "Coach Spark");

  if (existing) {
    // Update instructions in case curriculum context changed
    return await openai.beta.assistants.update(existing.id, {
      instructions,
    });
  }

  // Create new assistant
  return await openai.beta.assistants.create({
    name: "Coach Spark",
    instructions,
    model: "gpt-4o", // GPT-4 Turbo for best reasoning
    tools: COACH_SPARK_TOOLS,
  });
}
