/**
 * OpenAI Thread Manager
 *
 * Manages student threads and curriculum progress persistence.
 * Unlike the old session system, conversation context is stored in OpenAI threads,
 * but curriculum progress is stored locally for quick access and offline capability.
 */

import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { curriculumEngine } from "../curriculum/index.js";
import type { CurriculumProgress } from "../curriculum/types.js";

const PROGRESS_DIR = path.join(process.cwd(), ".progress");

/**
 * Student thread context
 */
export interface StudentThread {
  threadId: string;
  studentId: string;
  grade: number;
  progress: CurriculumProgress;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Ensure progress directory exists
 */
async function ensureProgressDir(): Promise<void> {
  try {
    await fs.access(PROGRESS_DIR);
  } catch {
    await fs.mkdir(PROGRESS_DIR, { recursive: true });
  }
}

/**
 * Get progress file path for a student
 */
function getProgressFilePath(studentId: string): string {
  return path.join(PROGRESS_DIR, `${studentId}.json`);
}

/**
 * Load student's curriculum progress from disk
 */
export async function loadProgress(studentId: string): Promise<CurriculumProgress | null> {
  try {
    const filePath = getProgressFilePath(studentId);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as CurriculumProgress;
  } catch (error) {
    // File doesn't exist - student is new
    return null;
  }
}

/**
 * Save student's curriculum progress to disk
 */
export async function saveProgress(progress: CurriculumProgress): Promise<void> {
  await ensureProgressDir();
  const filePath = getProgressFilePath(progress.studentId);
  await fs.writeFile(filePath, JSON.stringify(progress, null, 2), "utf-8");
}

/**
 * Create or load a student thread
 */
export async function getOrCreateStudentThread(
  openai: OpenAI,
  studentId: string,
  grade: number
): Promise<StudentThread> {
  // Try to load existing progress
  let progress = await loadProgress(studentId);

  if (progress) {
    // Existing student - retrieve or create thread
    // Note: In production, you'd store threadId in the progress file
    // For now, create a new thread each session (threads are cheap)
    const thread = await openai.beta.threads.create({
      metadata: {
        studentId,
        grade: grade.toString(),
      },
    });

    return {
      threadId: thread.id,
      studentId,
      grade,
      progress,
      createdAt: progress.lastUpdated,
      lastUpdated: new Date().toISOString(),
    };
  } else {
    // New student - create progress and thread
    progress = curriculumEngine.createNewProgress(studentId, grade);
    await saveProgress(progress);

    const thread = await openai.beta.threads.create({
      metadata: {
        studentId,
        grade: grade.toString(),
      },
    });

    const studentThread: StudentThread = {
      threadId: thread.id,
      studentId,
      grade,
      progress,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    return studentThread;
  }
}

/**
 * Update student's curriculum progress
 */
export async function updateStudentProgress(
  studentThread: StudentThread,
  updatedProgress: CurriculumProgress
): Promise<StudentThread> {
  await saveProgress(updatedProgress);

  return {
    ...studentThread,
    progress: updatedProgress,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Add a message to the student's thread
 */
export async function addMessageToThread(
  openai: OpenAI,
  threadId: string,
  content: string,
  role: "user" | "assistant" = "user"
): Promise<OpenAI.Beta.Threads.Message> {
  return await openai.beta.threads.messages.create(threadId, {
    role,
    content,
  });
}

/**
 * Get the latest messages from a thread
 */
export async function getThreadMessages(
  openai: OpenAI,
  threadId: string,
  limit: number = 10
): Promise<OpenAI.Beta.Threads.Message[]> {
  const messages = await openai.beta.threads.messages.list(threadId, {
    limit,
    order: "desc",
  });

  return messages.data;
}

/**
 * Run the assistant on a thread and wait for completion
 */
export async function runAssistantAndWait(
  openai: OpenAI,
  threadId: string,
  assistantId: string,
  onToolCall?: (toolName: string, args: any) => Promise<any>
): Promise<OpenAI.Beta.Threads.Run> {
  // Create run
  let run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  // Poll until complete
  while (run.status === "queued" || run.status === "in_progress" || run.status === "requires_action") {
    // Wait a bit before polling again
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle tool calls
    if (run.status === "requires_action" && run.required_action?.type === "submit_tool_outputs") {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      const toolOutputs: Array<{ tool_call_id: string; output: string }> = [];

      // Execute each tool call
      for (const toolCall of toolCalls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);

          console.log(`🔧 Tool call: ${functionName}`, args);

          // Call handler if provided
          let result: any;
          if (onToolCall) {
            result = await onToolCall(functionName, args);
          } else {
            result = { error: "No tool handler provided" };
          }

          toolOutputs.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result),
          });
        }
      }

      // Submit tool outputs
      run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolOutputs,
      });
    }

    // Get updated run status
    run = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  if (run.status === "failed") {
    console.error("❌ Run failed:", run.last_error);
    throw new Error(`Assistant run failed: ${run.last_error?.message || "Unknown error"}`);
  }

  return run;
}

/**
 * Get the assistant's response from a completed run
 */
export async function getAssistantResponse(
  openai: OpenAI,
  threadId: string
): Promise<string> {
  const messages = await getThreadMessages(openai, threadId, 1);

  if (messages.length === 0) {
    throw new Error("No messages found in thread");
  }

  const latestMessage = messages[0];

  if (latestMessage.role !== "assistant") {
    throw new Error("Latest message is not from assistant");
  }

  // Extract text from message content
  const textContent = latestMessage.content.find((c) => c.type === "text");

  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content found in assistant message");
  }

  return textContent.text.value;
}
