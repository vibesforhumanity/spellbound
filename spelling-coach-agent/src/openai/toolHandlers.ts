/**
 * OpenAI Assistant Tool Handlers
 *
 * Implements the actual functionality behind each tool that
 * Coach Spark can call.
 */

import { patternIntelligence } from "../patterns/index.js";
import { curriculumEngine } from "../curriculum/index.js";
import type { CurriculumProgress } from "../curriculum/types.js";

/**
 * Tool call result type
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Handle show_question tool call
 *
 * Formats question data for the iOS app to display
 */
export function handleShowQuestion(args: {
  template: string;
  word?: string;
  pattern?: string;
  sound?: string;
  options?: string[];
  context?: string;
}): ToolResult {
  try {
    // Validate template-specific requirements
    if (args.template === "multipleChoice" && (!args.options || args.options.length < 2)) {
      return {
        success: false,
        error: "multipleChoice template requires at least 2 options",
      };
    }

    if (args.template === "patternDetective" && !args.pattern) {
      return {
        success: false,
        error: "patternDetective template requires a pattern",
      };
    }

    if (
      (args.template === "listenAndSpell" || args.template === "wordBuilder") &&
      !args.word
    ) {
      return {
        success: false,
        error: `${args.template} template requires a word`,
      };
    }

    // Get pattern information if pattern provided
    let patternInfo = null;
    if (args.pattern) {
      const pattern = patternIntelligence.getPattern(args.pattern);
      if (pattern) {
        patternInfo = {
          pattern: args.pattern,
          displayName: pattern.displayName,
          sound: args.sound,
        };
      }
    }

    return {
      success: true,
      data: {
        template: args.template,
        word: args.word,
        pattern: patternInfo,
        options: args.options,
        context: args.context,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in show_question",
    };
  }
}

/**
 * Handle check_spelling tool call
 *
 * Validates spelling and identifies incorrect patterns
 */
export function handleCheckSpelling(args: {
  correctWord: string;
  studentAttempt: string;
  targetPatterns?: string[];
}): ToolResult {
  try {
    const correct = args.correctWord.toLowerCase();
    const attempt = args.studentAttempt.toLowerCase();

    // Check if correct
    const isCorrect = correct === attempt;

    // Analyze patterns in the correct word
    const patternAnalysis = patternIntelligence.analyzeWord(correct);

    // Identify which patterns were spelled incorrectly
    const incorrectPatterns: Array<{
      pattern: string;
      correctSpelling: string;
      studentSpelling: string;
      teachingTip: string;
    }> = [];

    if (!isCorrect && patternAnalysis.length > 0) {
      for (const { pattern, sound } of patternAnalysis) {
        // Find where this pattern appears in the correct word
        const patternIndex = correct.indexOf(pattern);
        if (patternIndex !== -1) {
          const patternEnd = patternIndex + pattern.length;

          // Check if student spelled this pattern correctly
          if (
            attempt.length > patternEnd &&
            attempt.substring(patternIndex, patternEnd) !== pattern
          ) {
            const patternKnowledge = patternIntelligence.getPattern(pattern);
            incorrectPatterns.push({
              pattern,
              correctSpelling: pattern,
              studentSpelling: attempt.substring(patternIndex, patternEnd),
              teachingTip: sound.teachingNote || `The '${pattern}' pattern says ${sound.pronunciation}`,
            });
          }
        }
      }
    }

    return {
      success: true,
      data: {
        isCorrect,
        correctWord: correct,
        studentAttempt: attempt,
        patterns: patternAnalysis.map((p) => ({
          pattern: p.pattern,
          sound: p.sound.pronunciation,
          confidence: p.confidence,
        })),
        incorrectPatterns,
        feedback: isCorrect
          ? `Perfect! '${correct}' is spelled correctly! ✨`
          : `Not quite. The correct spelling is '${correct}'. Let's look at what was tricky...`,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in check_spelling",
    };
  }
}

/**
 * Handle update_progress tool call
 *
 * Updates student's curriculum progress based on session results
 */
export function handleUpdateProgress(
  progress: CurriculumProgress,
  args: {
    correctWords: string[];
    incorrectWords: string[];
    patternAccuracy: Record<string, number>;
  }
): ToolResult {
  try {
    // Update progress using curriculum engine
    const updatedProgress = curriculumEngine.updateProgress(progress, {
      correctWords: args.correctWords,
      incorrectWords: args.incorrectWords,
      patternAccuracy: args.patternAccuracy,
    });

    // Calculate session stats
    const totalWords = args.correctWords.length + args.incorrectWords.length;
    const accuracy = totalWords > 0 ? args.correctWords.length / totalWords : 0;

    return {
      success: true,
      data: {
        progress: updatedProgress,
        sessionStats: {
          totalWords,
          correctWords: args.correctWords.length,
          accuracy,
          patternsUpdated: Object.keys(args.patternAccuracy).length,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in update_progress",
    };
  }
}

/**
 * Handle get_similar_words tool call
 *
 * Finds practice words for a specific pattern/sound
 */
export function handleGetSimilarWords(args: {
  pattern: string;
  sound?: string;
  count?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
}): ToolResult {
  try {
    const count = args.count || 5;

    // Get practice words from pattern intelligence
    const words = patternIntelligence.getPracticeWords(
      args.pattern,
      args.sound,
      count,
      args.difficulty
    );

    if (words.length === 0) {
      return {
        success: false,
        error: `No practice words found for pattern '${args.pattern}'${args.sound ? ` with sound '${args.sound}'` : ""}`,
      };
    }

    // Get pattern knowledge for context
    const patternKnowledge = patternIntelligence.getPattern(args.pattern);

    return {
      success: true,
      data: {
        pattern: args.pattern,
        sound: args.sound,
        words,
        patternInfo: patternKnowledge
          ? {
              displayName: patternKnowledge.displayName,
              type: patternKnowledge.type,
            }
          : null,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in get_similar_words",
    };
  }
}

/**
 * Handle advance_curriculum tool call
 *
 * Gets next curriculum recommendation based on performance
 */
export function handleAdvanceCurriculum(
  progress: CurriculumProgress,
  args: {
    recentAccuracy: number;
    lastSessionPatterns: string[];
  }
): ToolResult {
  try {
    // Get recommendation from curriculum engine
    const recommendation = curriculumEngine.getRecommendation(
      progress,
      args.recentAccuracy,
      args.lastSessionPatterns
    );

    return {
      success: true,
      data: {
        recommendation: {
          nextFocus: recommendation.nextFocus,
          reasoning: recommendation.reasoning,
          estimatedSessionsRemaining: recommendation.estimatedSessionsRemaining,
          sessionPlan: {
            sessionNumber: recommendation.recommendedSession.sessionNumber,
            focus: recommendation.recommendedSession.lessonPlan.focus,
            targetPatterns: recommendation.recommendedSession.lessonPlan.targetPatterns,
            vocabularyGoals: recommendation.recommendedSession.lessonPlan.vocabularyGoals,
            activities: recommendation.recommendedSession.lessonPlan.activities,
          },
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error in advance_curriculum",
    };
  }
}

/**
 * Main router for tool calls
 *
 * Dispatches to appropriate handler based on tool name
 */
export function handleToolCall(
  toolName: string,
  args: any,
  progress?: CurriculumProgress
): ToolResult {
  switch (toolName) {
    case "show_question":
      return handleShowQuestion(args);

    case "check_spelling":
      return handleCheckSpelling(args);

    case "update_progress":
      if (!progress) {
        return {
          success: false,
          error: "update_progress requires curriculum progress context",
        };
      }
      return handleUpdateProgress(progress, args);

    case "get_similar_words":
      return handleGetSimilarWords(args);

    case "advance_curriculum":
      if (!progress) {
        return {
          success: false,
          error: "advance_curriculum requires curriculum progress context",
        };
      }
      return handleAdvanceCurriculum(progress, args);

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}
