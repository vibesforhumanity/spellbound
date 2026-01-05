/**
 * Coach Spark Agent - Main Orchestrator
 *
 * Coordinates OpenAI Assistant, curriculum engine, and pattern intelligence
 * to provide adaptive, intelligent spelling coaching.
 */

import OpenAI from "openai";
import { getOrCreateCoachSparkAssistant } from "./assistantConfig.js";
import {
  getOrCreateStudentThread,
  updateStudentProgress,
  addMessageToThread,
  runAssistantAndWait,
  getAssistantResponse,
  saveProgress,
  type StudentThread,
} from "./threadManager.js";
import { handleToolCall } from "./toolHandlers.js";
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
 * Session response from Coach Spark
 */
export interface CoachSparkResponse {
  response: string;
  progress: CurriculumProgress;
  sessionUpdated: boolean;
}

/**
 * Start a new coaching session
 *
 * This is the main entry point for the iOS app to start a session.
 */
export async function startCoachingSession(
  studentId: string,
  grade: number,
  initialMessage?: string
): Promise<CoachSparkResponse> {
  const openai = getOpenAIClient();

  // Get or create student thread
  let studentThread = await getOrCreateStudentThread(openai, studentId, grade);

  // Create/update assistant with current progress context
  const assistant = await getOrCreateCoachSparkAssistant(
    openai,
    grade,
    studentThread.progress
  );

  // Add initial message if provided
  const message =
    initialMessage ||
    "Hi Coach Spark! I'm ready to practice my spelling. What should we work on today?";

  await addMessageToThread(openai, studentThread.threadId, message);

  // Run assistant with tool call handler
  await runAssistantAndWait(
    openai,
    studentThread.threadId,
    assistant.id,
    async (toolName, args) => {
      return handleToolCall(toolName, args, studentThread.progress);
    }
  );

  // Get assistant's response
  const response = await getAssistantResponse(openai, studentThread.threadId);

  return {
    response,
    progress: studentThread.progress,
    sessionUpdated: false,
  };
}

/**
 * Submit student's answer and get feedback
 *
 * Called when student submits a spelling attempt.
 */
export async function submitAnswer(
  studentId: string,
  threadId: string,
  answer: string
): Promise<CoachSparkResponse> {
  const openai = getOpenAIClient();

  // Load student thread (we need the progress context)
  const studentThread = await getOrCreateStudentThread(openai, studentId, 2); // TODO: Get grade from storage

  // Get assistant
  const assistant = await getOrCreateCoachSparkAssistant(
    openai,
    studentThread.grade,
    studentThread.progress
  );

  // Add student's answer to thread
  await addMessageToThread(openai, threadId, answer);

  // Run assistant with tool call handler
  await runAssistantAndWait(openai, threadId, assistant.id, async (toolName, args) => {
    const result = handleToolCall(toolName, args, studentThread.progress);

    // If progress was updated, save it
    if (toolName === "update_progress" && result.success) {
      studentThread.progress = result.data.progress;
      await saveProgress(studentThread.progress);
    }

    return result;
  });

  // Get assistant's response
  const response = await getAssistantResponse(openai, threadId);

  return {
    response,
    progress: studentThread.progress,
    sessionUpdated: false,
  };
}

/**
 * Ask Coach Spark a question
 *
 * For when student has a question about word origins, patterns, etc.
 */
export async function askQuestion(
  studentId: string,
  threadId: string,
  question: string
): Promise<CoachSparkResponse> {
  const openai = getOpenAIClient();

  // Load student context
  const studentThread = await getOrCreateStudentThread(openai, studentId, 2); // TODO: Get grade from storage

  // Get assistant
  const assistant = await getOrCreateCoachSparkAssistant(
    openai,
    studentThread.grade,
    studentThread.progress
  );

  // Add question to thread
  await addMessageToThread(openai, threadId, question);

  // Run assistant
  await runAssistantAndWait(openai, threadId, assistant.id, async (toolName, args) => {
    return handleToolCall(toolName, args, studentThread.progress);
  });

  // Get response
  const response = await getAssistantResponse(openai, threadId);

  return {
    response,
    progress: studentThread.progress,
    sessionUpdated: false,
  };
}

/**
 * End current session and get next session recommendation
 *
 * Called when student finishes their practice session.
 */
export async function endSession(
  studentId: string,
  threadId: string,
  sessionResults: {
    correctWords: string[];
    incorrectWords: string[];
    patternAccuracy: Record<string, number>;
  }
): Promise<{
  response: string;
  progress: CurriculumProgress;
  nextSessionRecommendation: any;
}> {
  const openai = getOpenAIClient();

  // Load student context
  let studentThread = await getOrCreateStudentThread(openai, studentId, 2); // TODO: Get grade from storage

  // Get assistant
  const assistant = await getOrCreateCoachSparkAssistant(
    openai,
    studentThread.grade,
    studentThread.progress
  );

  // Add message about ending session
  const totalWords = sessionResults.correctWords.length + sessionResults.incorrectWords.length;
  const accuracy = totalWords > 0 ? sessionResults.correctWords.length / totalWords : 0;

  await addMessageToThread(
    openai,
    threadId,
    `I'm done with my practice! I got ${sessionResults.correctWords.length} out of ${totalWords} words correct.`
  );

  let nextRecommendation: any = null;

  // Run assistant with tool call handler
  await runAssistantAndWait(openai, threadId, assistant.id, async (toolName, args) => {
    const result = handleToolCall(toolName, args, studentThread.progress);

    // Update progress if needed
    if (toolName === "update_progress" && result.success) {
      studentThread.progress = result.data.progress;
      await saveProgress(studentThread.progress);
    }

    // Capture next session recommendation
    if (toolName === "advance_curriculum" && result.success) {
      nextRecommendation = result.data.recommendation;
    }

    return result;
  });

  // Get assistant's response
  const response = await getAssistantResponse(openai, threadId);

  return {
    response,
    progress: studentThread.progress,
    nextSessionRecommendation: nextRecommendation,
  };
}

/**
 * Get curriculum progress for a student
 *
 * Utility function to check progress without starting a session.
 */
export async function getStudentProgress(
  studentId: string,
  grade: number
): Promise<CurriculumProgress> {
  const openai = getOpenAIClient();
  const studentThread = await getOrCreateStudentThread(openai, studentId, grade);
  return studentThread.progress;
}
