import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface SessionContext {
  sessionId: string;
  studentName?: string;
  gradeLevel?: string;
  masteredWords: string[];
  strugglingWords: string[];
  masteredPatterns: string[];
  strugglingPatterns: string[];
  learningStyle?: "visual" | "auditory" | "kinesthetic" | "mixed";
  notes: string[];
  createdAt: string;
  lastUpdated: string;
}

const SESSIONS_DIR = join(process.cwd(), ".sessions");

/**
 * Ensure sessions directory exists
 */
async function ensureSessionsDir() {
  await mkdir(SESSIONS_DIR, { recursive: true });
}

/**
 * Load existing session context from disk
 */
export async function loadSession(sessionId: string): Promise<SessionContext | null> {
  try {
    await ensureSessionsDir();
    const filePath = join(SESSIONS_DIR, `${sessionId}.json`);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null; // Session doesn't exist
  }
}

/**
 * Save session context to disk
 */
export async function saveSession(context: SessionContext): Promise<void> {
  await ensureSessionsDir();
  const filePath = join(SESSIONS_DIR, `${context.sessionId}.json`);
  context.lastUpdated = new Date().toISOString();
  await writeFile(filePath, JSON.stringify(context, null, 2), "utf-8");
}

/**
 * Create a new session context
 */
export function createSessionContext(sessionId: string): SessionContext {
  return {
    sessionId,
    masteredWords: [],
    strugglingWords: [],
    masteredPatterns: [],
    strugglingPatterns: [],
    notes: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Update session context with practice session results
 */
export async function updateSessionFromPractice(
  sessionId: string,
  practiceResults: {
    correctWords: string[];
    incorrectWords: string[];
    masteredPatterns: string[];
    challengingPatterns: string[];
  }
): Promise<SessionContext> {
  let context = await loadSession(sessionId);
  if (!context) {
    context = createSessionContext(sessionId);
  }

  // Update words
  for (const word of practiceResults.correctWords) {
    if (!context.masteredWords.includes(word)) {
      context.masteredWords.push(word);
    }
    // Remove from struggling if it was there
    context.strugglingWords = context.strugglingWords.filter((w) => w !== word);
  }

  for (const word of practiceResults.incorrectWords) {
    if (!context.strugglingWords.includes(word)) {
      context.strugglingWords.push(word);
    }
  }

  // Update patterns
  for (const pattern of practiceResults.masteredPatterns) {
    if (!context.masteredPatterns.includes(pattern)) {
      context.masteredPatterns.push(pattern);
    }
    context.strugglingPatterns = context.strugglingPatterns.filter((p) => p !== pattern);
  }

  for (const pattern of practiceResults.challengingPatterns) {
    if (!context.strugglingPatterns.includes(pattern)) {
      context.strugglingPatterns.push(pattern);
    }
  }

  await saveSession(context);
  return context;
}

/**
 * Build context message to include in system prompt for this session
 */
export function buildSessionContextMessage(context: SessionContext): string {
  const parts: string[] = [];

  if (context.studentName) {
    parts.push(`Student: ${context.studentName}`);
  }

  if (context.gradeLevel) {
    parts.push(`Grade Level: ${context.gradeLevel}`);
  }

  if (context.masteredWords.length > 0) {
    parts.push(`Recently Mastered Words: ${context.masteredWords.slice(-10).join(", ")}`);
  }

  if (context.strugglingWords.length > 0) {
    parts.push(`Words to Focus On: ${context.strugglingWords.slice(-10).join(", ")}`);
  }

  if (context.masteredPatterns.length > 0) {
    parts.push(`Mastered Patterns: ${context.masteredPatterns.join(", ")}`);
  }

  if (context.strugglingPatterns.length > 0) {
    parts.push(`Patterns to Practice: ${context.strugglingPatterns.join(", ")}`);
  }

  if (context.learningStyle) {
    parts.push(`Preferred Learning Style: ${context.learningStyle}`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `## Session Context\n${parts.join("\n")}\n\n`;
}

export default {
  loadSession,
  saveSession,
  createSessionContext,
  updateSessionFromPractice,
  buildSessionContextMessage,
  SESSIONS_DIR,
};
