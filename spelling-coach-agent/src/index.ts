import { analyzePracticeSession, generatePatternQuestion } from "./agent.js";

/**
 * Example 1: Practice session analysis (iOS App Integration)
 * This demonstrates how the Spellbound iOS app integrates with the agent
 */
async function example1_PracticeSessionAnalysis() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 1: Practice Session Analysis (iOS App Integration)");
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
  console.log("\n💬 Coach Response:");
  console.log(response);
}

/**
 * Example 2: Generate multiple choice question for pattern reinforcement
 * Pattern mastery through adaptive questioning
 */
async function example2_GenerateMultipleChoice() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMPLE 2: Generate Multiple Choice Question");
  console.log("=".repeat(60));

  const result = await generatePatternQuestion(
    "test-session-001",
    "action",
    "actshun",
    "-tion suffix",
    0
  );

  if (result.success) {
    console.log("\n✅ Generated Question:");
    console.log(JSON.stringify(result.question, null, 2));
  } else {
    console.log("\n❌ Failed to generate question:");
    console.log(result.error);
  }
}

/**
 * Main execution
 * Run all examples or specific ones
 */
async function main() {
  try {
    // Uncomment the examples you want to run:

    // Example 1: iOS app integration - practice session analysis
    // await example1_PracticeSessionAnalysis();

    // Example 2: Generate multiple choice question
    await example2_GenerateMultipleChoice();

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
  example1_PracticeSessionAnalysis,
  example2_GenerateMultipleChoice,
};
