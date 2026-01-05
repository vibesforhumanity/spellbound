/**
 * Grade 2 Curriculum
 *
 * Comprehensive spelling curriculum for 2nd grade students.
 * Focuses on phonics patterns, high-frequency words, and building
 * independent spelling skills.
 */

import type { YearlyCurriculum } from "./types.js";

export const GRADE_2_CURRICULUM: YearlyCurriculum = {
  grade: 2,

  objectives: [
    "Master 200+ high-frequency words",
    "Understand 15 common vowel teams (ea, ee, ai, ay, oa, ow, etc.)",
    "Learn 10 basic suffixes (-ing, -ed, -er, -est, -ly, etc.)",
    "Master all short and long vowel patterns",
    "Build pattern recognition and application skills",
    "Develop confidence in spelling unknown words",
  ],

  prerequisites: [
    "Letter recognition and formation",
    "Basic phonemic awareness",
    "CVC (consonant-vowel-consonant) word patterns",
    "Ability to segment and blend sounds",
  ],

  targetVocabularySize: 250,

  units: [
    // ========================================================================
    // UNIT 1: Review & Foundation
    // ========================================================================
    {
      unitNumber: 1,
      name: "Short Vowels Review",
      duration: 4,
      prerequisite: {
        patterns: [],
        masteryRequired: 0.0, // Starting point
      },
      learningGoals: [
        "Review short vowel sounds (a, e, i, o, u)",
        "Master CVC word patterns",
        "Build confidence with familiar words",
        "Establish baseline for adaptive learning",
      ],
      sessionPlans: [
        {
          sessionNumber: 1,
          lessonPlan: {
            focus: "Short 'a' and 'e' sounds",
            targetPatterns: [
              { pattern: "short_a", examples: ["cat", "bat", "hat", "mat", "sat"] },
              { pattern: "short_e", examples: ["bed", "red", "led", "fed", "wed"] },
            ],
            vocabularyGoals: ["cat", "bat", "hat", "bed", "red", "led", "mat", "sat", "fed", "wed"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3, reinforcement: true },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Slow down, add more review",
              nextSession: "Repeat session 1 with different words",
            },
            ifMastering: {
              action: "Move ahead faster",
              nextSession: "Skip to session 3",
            },
          },
        },
        {
          sessionNumber: 2,
          lessonPlan: {
            focus: "Short 'i', 'o', and 'u' sounds",
            targetPatterns: [
              { pattern: "short_i", examples: ["sit", "hit", "bit", "fit", "pit"] },
              { pattern: "short_o", examples: ["hot", "pot", "dot", "got", "not"] },
              { pattern: "short_u", examples: ["cut", "but", "hut", "nut", "shut"] },
            ],
            vocabularyGoals: ["sit", "hit", "hot", "pot", "cut", "but", "fit", "dot", "hut", "got"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Review previous session",
              nextSession: "Repeat session 2",
            },
            ifMastering: {
              action: "Add challenge",
              nextSession: "Session 3 with harder words",
            },
          },
        },
        {
          sessionNumber: 3,
          lessonPlan: {
            focus: "Mixed short vowels",
            targetPatterns: [
              { pattern: "mixed_short_vowels", examples: ["cat", "sit", "hot", "cut", "bed"] },
            ],
            vocabularyGoals: ["big", "can", "dog", "fun", "get", "had", "map", "pen", "run", "top"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "patternDetective", count: 3, challenge: "Think of a short vowel word" },
            ],
            exitCriteria: {
              minimumCorrect: 9,
              patternMastery: 0.75,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "More practice with individual vowels",
              nextSession: "Review sessions 1-2",
            },
            ifMastering: {
              action: "Ready for new content",
              nextSession: "Move to Unit 2",
            },
          },
        },
        {
          sessionNumber: 4,
          lessonPlan: {
            focus: "Unit assessment & mastery check",
            targetPatterns: [
              { pattern: "all_short_vowels", examples: [] },
            ],
            vocabularyGoals: ["mix of all previous words"],
            activities: [
              { template: "listenAndSpell", count: 15, difficulty: "easy" },
            ],
            exitCriteria: {
              minimumCorrect: 13,
              patternMastery: 0.85,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Extend unit, more practice needed",
              nextSession: "Additional practice session",
            },
            ifMastering: {
              action: "Unit complete!",
              nextSession: "Begin Unit 2",
            },
          },
        },
      ],
      assessment: {
        masteryThreshold: 0.85,
        minSessionsRequired: 4,
        exitCriteria: "Student can spell 85%+ of short vowel CVC words accurately",
      },
    },

    // ========================================================================
    // UNIT 2: Consonant Digraphs
    // ========================================================================
    {
      unitNumber: 2,
      name: "Consonant Digraphs (sh, ch, th)",
      duration: 6,
      prerequisite: {
        patterns: ["short vowels"],
        masteryRequired: 0.8,
      },
      learningGoals: [
        "Understand that two letters can make one sound",
        "Master 'sh', 'ch', and 'th' digraphs",
        "Apply digraphs in reading and spelling",
        "Recognize digraphs at beginning and end of words",
      ],
      sessionPlans: [
        {
          sessionNumber: 1,
          lessonPlan: {
            focus: "Introduce 'sh' digraph",
            targetPatterns: [
              { pattern: "sh", sound: "'sh' sound", examples: ["ship", "fish", "wish", "shop", "brush"] },
            ],
            vocabularyGoals: ["ship", "fish", "wish", "shop", "brush", "shut", "cash", "dish", "rush", "shed"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3, reinforcement: true },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "More 'sh' practice",
              nextSession: "Repeat session 1 with new words",
            },
            ifMastering: {
              action: "Move to next digraph",
              nextSession: "Session 2",
            },
          },
        },
        {
          sessionNumber: 2,
          lessonPlan: {
            focus: "Introduce 'ch' digraph",
            targetPatterns: [
              { pattern: "ch", sound: "'ch' sound", examples: ["chip", "chat", "much", "lunch", "beach"] },
            ],
            vocabularyGoals: ["chip", "chat", "much", "lunch", "beach", "chop", "rich", "such", "bench", "check"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Review and practice",
              nextSession: "Extra 'ch' practice",
            },
            ifMastering: {
              action: "Continue sequence",
              nextSession: "Session 3",
            },
          },
        },
        {
          sessionNumber: 3,
          lessonPlan: {
            focus: "Contrast 'sh' and 'ch'",
            targetPatterns: [
              { pattern: "sh", examples: ["ship", "fish"] },
              { pattern: "ch", examples: ["chip", "lunch"] },
            ],
            vocabularyGoals: ["shop vs chop", "cash vs catch", "wish vs witch"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "medium" },
              { template: "patternDetective", count: 3, challenge: "Find words with 'sh' or 'ch'" },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.75,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Review both digraphs",
              nextSession: "More contrast practice",
            },
            ifMastering: {
              action: "Add third digraph",
              nextSession: "Session 4",
            },
          },
        },
        {
          sessionNumber: 4,
          lessonPlan: {
            focus: "Introduce 'th' digraph (both sounds)",
            targetPatterns: [
              { pattern: "th", sound: "voiced 'th' (as in 'this')", examples: ["this", "that", "them"] },
              { pattern: "th", sound: "unvoiced 'th' (as in 'think')", examples: ["think", "bath", "math"] },
            ],
            vocabularyGoals: ["this", "that", "them", "think", "bath", "math", "then", "with", "path", "both"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "medium" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "'th' is tricky, more practice",
              nextSession: "Repeat session 4",
            },
            ifMastering: {
              action: "Practice all three",
              nextSession: "Session 5",
            },
          },
        },
        {
          sessionNumber: 5,
          lessonPlan: {
            focus: "Mixed digraph practice",
            targetPatterns: [
              { pattern: "sh", examples: ["ship", "fish"] },
              { pattern: "ch", examples: ["chip", "lunch"] },
              { pattern: "th", examples: ["this", "bath"] },
            ],
            vocabularyGoals: ["mix of all digraph words"],
            activities: [
              { template: "listenAndSpell", count: 12, difficulty: "medium" },
              { template: "patternDetective", count: 3, challenge: "Generate digraph words" },
            ],
            exitCriteria: {
              minimumCorrect: 10,
              patternMastery: 0.8,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Target weakest digraph",
              nextSession: "Focused review",
            },
            ifMastering: {
              action: "Ready for assessment",
              nextSession: "Session 6",
            },
          },
        },
        {
          sessionNumber: 6,
          lessonPlan: {
            focus: "Unit assessment - All digraphs",
            targetPatterns: [
              { pattern: "all_digraphs", examples: [] },
            ],
            vocabularyGoals: ["comprehensive mix"],
            activities: [
              { template: "listenAndSpell", count: 15, difficulty: "medium" },
            ],
            exitCriteria: {
              minimumCorrect: 13,
              patternMastery: 0.85,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Extend unit",
              nextSession: "Additional practice",
            },
            ifMastering: {
              action: "Unit complete!",
              nextSession: "Begin Unit 3",
            },
          },
        },
      ],
      assessment: {
        masteryThreshold: 0.85,
        minSessionsRequired: 6,
        exitCriteria: "Student can recognize and spell 'sh', 'ch', 'th' words with 85%+ accuracy",
      },
    },

    // ========================================================================
    // UNIT 3: Vowel Teams 'ea' and 'ee'
    // ========================================================================
    {
      unitNumber: 3,
      name: "Vowel Teams: 'ea' and 'ee'",
      duration: 6,
      prerequisite: {
        patterns: ["short vowels", "digraphs"],
        masteryRequired: 0.8,
      },
      learningGoals: [
        "Understand vowel teams concept",
        "Master 'ea' → long 'e' sound (most common)",
        "Master 'ee' → long 'e' sound (consistent)",
        "Distinguish between 'ea' and 'ee'",
        "Introduce 'ea' sound variations (advanced)",
      ],
      sessionPlans: [
        {
          sessionNumber: 1,
          lessonPlan: {
            focus: "Introduce 'ee' (consistent pattern)",
            targetPatterns: [
              { pattern: "ee", sound: "long 'e' (ee)", examples: ["tree", "see", "free", "green", "sleep"] },
            ],
            vocabularyGoals: ["tree", "see", "free", "green", "sleep", "feet", "meet", "week", "keep", "deep"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "More 'ee' practice",
              nextSession: "Repeat with new words",
            },
            ifMastering: {
              action: "Introduce 'ea'",
              nextSession: "Session 2",
            },
          },
        },
        {
          sessionNumber: 2,
          lessonPlan: {
            focus: "Introduce 'ea' → long 'e' sound",
            targetPatterns: [
              { pattern: "ea", sound: "long 'e' (ee)", examples: ["beach", "teach", "dream", "team", "sea"] },
            ],
            vocabularyGoals: ["beach", "teach", "dream", "team", "sea", "read", "please", "east", "beast", "feast"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "easy" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Practice 'ea' more",
              nextSession: "Additional 'ea' words",
            },
            ifMastering: {
              action: "Compare patterns",
              nextSession: "Session 3",
            },
          },
        },
        {
          sessionNumber: 3,
          lessonPlan: {
            focus: "Contrast 'ea' vs 'ee' (both say long 'e')",
            targetPatterns: [
              { pattern: "ea", sound: "long 'e' (ee)", examples: ["beach", "teach"] },
              { pattern: "ee", sound: "long 'e' (ee)", examples: ["tree", "see"] },
            ],
            vocabularyGoals: ["mix of 'ea' and 'ee' words"],
            activities: [
              { template: "listenAndSpell", count: 12, difficulty: "medium" },
              { template: "patternDetective", count: 3, challenge: "Which pattern: 'ea' or 'ee'?" },
            ],
            exitCriteria: {
              minimumCorrect: 10,
              patternMastery: 0.75,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Review difference",
              nextSession: "More contrast practice",
            },
            ifMastering: {
              action: "Introduce variation",
              nextSession: "Session 4",
            },
          },
        },
        {
          sessionNumber: 4,
          lessonPlan: {
            focus: "Introduce 'ea' → short 'e' variation (bread, head)",
            targetPatterns: [
              { pattern: "ea", sound: "short 'e' (eh)", examples: ["bread", "head", "ready"] },
            ],
            vocabularyGoals: ["bread", "head", "ready", "heavy", "weather", "spread", "thread", "instead"],
            activities: [
              { template: "listenAndSpell", count: 8, difficulty: "medium" },
              { template: "multipleChoice", count: 4, reinforcement: true },
            ],
            exitCriteria: {
              minimumCorrect: 6,
              patternMastery: 0.65,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "This is advanced, OK to struggle",
              nextSession: "More practice with variation",
            },
            ifMastering: {
              action: "They're getting it!",
              nextSession: "Session 5",
            },
          },
        },
        {
          sessionNumber: 5,
          lessonPlan: {
            focus: "Practice both 'ea' sounds (beach vs bread)",
            targetPatterns: [
              { pattern: "ea", sound: "long 'e' (ee)", examples: ["beach", "dream"] },
              { pattern: "ea", sound: "short 'e' (eh)", examples: ["bread", "head"] },
            ],
            vocabularyGoals: ["mix of both 'ea' sounds"],
            activities: [
              { template: "listenAndSpell", count: 12, difficulty: "hard" },
              { template: "patternDetective", count: 3, challenge: "Which 'ea' sound?" },
            ],
            exitCriteria: {
              minimumCorrect: 9,
              patternMastery: 0.75,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Focus on common 'ea' → 'ee'",
              nextSession: "Simplify for success",
            },
            ifMastering: {
              action: "Ready for assessment",
              nextSession: "Session 6",
            },
          },
        },
        {
          sessionNumber: 6,
          lessonPlan: {
            focus: "Unit assessment - 'ea' and 'ee' patterns",
            targetPatterns: [
              { pattern: "ea", examples: [] },
              { pattern: "ee", examples: [] },
            ],
            vocabularyGoals: ["comprehensive mix"],
            activities: [
              { template: "listenAndSpell", count: 15, difficulty: "medium" },
            ],
            exitCriteria: {
              minimumCorrect: 13,
              patternMastery: 0.85,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "Extend unit, focus on 'ee' and common 'ea'",
              nextSession: "Additional practice",
            },
            ifMastering: {
              action: "Unit complete!",
              nextSession: "Begin Unit 4",
            },
          },
        },
      ],
      assessment: {
        masteryThreshold: 0.85,
        minSessionsRequired: 6,
        exitCriteria: "Student can spell 'ee' and common 'ea' words with 85%+ accuracy",
      },
    },

    // ========================================================================
    // UNIT 4: Long Vowels with Silent E
    // ========================================================================
    {
      unitNumber: 4,
      name: "Magic E (Silent E) Patterns",
      duration: 6,
      prerequisite: {
        patterns: ["short vowels", "vowel teams"],
        masteryRequired: 0.8,
      },
      learningGoals: [
        "Understand the 'magic e' rule",
        "Transform short vowel words to long vowel words",
        "Master CVCe (consonant-vowel-consonant-e) pattern",
        "Apply to all five vowels (a, e, i, o, u)",
      ],
      sessionPlans: [
        {
          sessionNumber: 1,
          lessonPlan: {
            focus: "Introduce magic e with 'a' (cap → cape)",
            targetPatterns: [
              { pattern: "silent_e", sound: "makes previous vowel long", examples: ["make", "cake", "take", "name", "same"] },
            ],
            vocabularyGoals: ["make", "cake", "take", "name", "same", "made", "late", "came", "game", "safe"],
            activities: [
              { template: "listenAndSpell", count: 10, difficulty: "medium" },
              { template: "multipleChoice", count: 3 },
            ],
            exitCriteria: {
              minimumCorrect: 8,
              patternMastery: 0.7,
            },
          },
          adaptiveBranching: {
            ifStruggling: {
              action: "More magic e practice with 'a'",
              nextSession: "Repeat session 1",
            },
            ifMastering: {
              action: "Try another vowel",
              nextSession: "Session 2",
            },
          },
        },
        // Additional sessions for 'i', 'o', 'u' magic e...
        // (Sessions 2-6 would follow similar pattern)
      ],
      assessment: {
        masteryThreshold: 0.85,
        minSessionsRequired: 6,
        exitCriteria: "Student can apply magic e rule to all vowels with 85%+ accuracy",
      },
    },

    // ========================================================================
    // Additional Units would continue...
    // Unit 5: R-Controlled Vowels (ar, er, ir, or, ur)
    // Unit 6: More Vowel Teams (ai, ay, oa, ow)
    // Unit 7: Consonant Blends (bl, cr, st, etc.)
    // Unit 8: Suffixes (-ing, -ed, -er, -est)
    // ... up to 30-36 units for the full year
    // ========================================================================
  ],
};
