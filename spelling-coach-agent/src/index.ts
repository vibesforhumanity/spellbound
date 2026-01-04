import { runSpellingCoachAgent, resumeSpellingCoachSession, analyzePracticeSession } from "./agent.js";

/**
 * Example 1: Basic coaching conversation
 * Start a new session where a student asks for help with a word
 */
async function example1_BasicCoaching() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 1: Basic Coaching Conversation");
  console.log("=".repeat(60));

  const userPrompt = `
    Hi Coach Spark! My name is Emma and I'm in 2nd grade.
    I'm having trouble spelling the word "beautiful".
    Can you help me understand it better?
  `;

  const { sessionContext, response } = await runSpellingCoachAgent(userPrompt);

  console.log("\n📊 Session Summary:");
  console.log(`   Session ID: ${sessionContext.sessionId}`);
  console.log(`   Student: ${sessionContext.studentName || "Not yet set"}`);
  console.log(`   Mastered Words: ${sessionContext.masteredWords.join(", ") || "None yet"}`);
  console.log(`   Notes: ${sessionContext.notes.length} interaction(s)`);

  return sessionContext.sessionId;
}

/**
 * Example 2: Analyze practice session results
 * This is how the Spellbound iOS app would integrate with the agent
 */
async function example2_PracticeSessionAnalysis() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 2: Practice Session Analysis (iOS App Integration)");
  console.log("=".repeat(60));

  // Simulated results from a Spellbound practice session
  const practiceResults = {
    correctWords: ["cat", "dog", "fish", "moon", "book"],
    incorrectWords: ["beautiful", "afternoon", "treasure"],
    masteredPatterns: ["Short vowels (CVC)", "Digraph 'sh'"],
    challengingPatterns: ["Vowel team 'ea'", "Vowel team 'oo'", "Silent 'e'"],
    missedWordsByPattern: {
      "Vowel team 'ea'": ["beautiful", "treasure"],
      "Vowel team 'oo'": ["afternoon"],
    },
  };

  // Student also has a question about word origins
  const studentQuestion = "Why is 'beautiful' spelled with 'eau'? That seems weird!";

  const { sessionContext, response } = await analyzePracticeSession(
    "practice-session-001",
    practiceResults,
    studentQuestion
  );

  console.log("\n📊 Updated Session Context:");
  console.log(`   Mastered Words: ${sessionContext.masteredWords.length}`);
  console.log(`   Struggling Words: ${sessionContext.strugglingWords.join(", ")}`);
  console.log(`   Mastered Patterns: ${sessionContext.masteredPatterns.join(", ")}`);
  console.log(`   Struggling Patterns: ${sessionContext.strugglingPatterns.join(", ")}`);
}

/**
 * Example 3: Resume previous session
 * Continue a conversation with the agent from a previous session
 */
async function example3_ResumeSession(sessionId: string) {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 3: Resume Previous Session");
  console.log("=".repeat(60));

  const followUpPrompt = `
    Now can you help me with the word 'friend'?
    I always forget if it's 'ie' or 'ei'.
  `;

  const { sessionContext, response } = await resumeSpellingCoachSession(
    sessionId,
    followUpPrompt
  );

  console.log("\n📊 Session Progress:");
  console.log(`   Total Words Practiced: ${sessionContext.masteredWords.length + sessionContext.strugglingWords.length}`);
  console.log(`   Mastered: ${sessionContext.masteredWords.length}`);
  console.log(`   Still Practicing: ${sessionContext.strugglingWords.length}`);
}

/**
 * Example 4: Etymology and heteronym questions
 * Student asks about word origins and confusing words
 */
async function example4_EtymologyQuestions() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 4: Etymology & Heteronym Questions");
  console.log("=".repeat(60));

  const etymologyPrompt = `
    Hi Coach Spark! I have some questions:

    1. What's the difference between "read" (present) and "read" (past)?
    2. Where does the word "telephone" come from?
    3. Why do we spell "knight" with a 'k' if we don't say it?
  `;

  const { sessionContext, response } = await runSpellingCoachAgent(etymologyPrompt);

  console.log("\n✅ Questions answered!");
}

/**
 * Example 5: Generate multiple choice question for pattern reinforcement
 * NEW: Pattern mastery through adaptive questioning
 */
async function example5_GenerateMultipleChoice() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 5: Generate Multiple Choice Question (NEW)");
  console.log("=".repeat(60));

  const questionPrompt = `
    The student just misspelled "action" as "actshun". They're struggling with the "-tion" suffix pattern.

    Generate a multiple choice question to help them practice identifying the correct spelling of words with the "-tion" pattern.

    Format your response EXACTLY as JSON:
    {
      "question": "Which word is spelled correctly?",
      "options": ["a) nation", "b) vacation", "c) stashun", "d) mention"],
      "correctAnswer": "c) stashun",
      "explanation": "The -tion suffix makes the 'shun' sound, as in nation, vacation, and mention. 'Station' is spelled with -tion, not -shun."
    }

    Make sure:
    - Include 3 correct spellings and 1 incorrect spelling
    - The incorrect option should use common misspelling patterns (like 'shun' instead of 'tion')
    - Keep it age-appropriate for elementary students
    - Provide a clear, educational explanation
  `;

  const { response } = await runSpellingCoachAgent(questionPrompt);

  console.log("\n📝 Generated Question:");
  console.log(response);

  // Try to parse JSON from response
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const question = JSON.parse(jsonMatch[0]);
      console.log("\n✅ Parsed Question:");
      console.log(JSON.stringify(question, null, 2));
    }
  } catch (e) {
    console.log("⚠️  Could not parse JSON from response");
  }
}

/**
 * Main execution
 * Run all examples or specific ones
 */
async function main() {
  try {
    // Uncomment the examples you want to run:

    // Example 1: Basic coaching
    // const sessionId = await example1_BasicCoaching();

    // Example 2: iOS app integration
    // await example2_PracticeSessionAnalysis();

    // Example 3: Resume session (requires sessionId from Example 1)
    // await example3_ResumeSession(sessionId);

    // Example 4: Etymology questions
    // await example4_EtymologyQuestions();

    // Example 5: Generate multiple choice question (NEW!)
    await example5_GenerateMultipleChoice();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All examples completed successfully!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error running examples:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  example1_BasicCoaching,
  example2_PracticeSessionAnalysis,
  example3_ResumeSession,
  example4_EtymologyQuestions,
  example5_GenerateMultipleChoice,
};
