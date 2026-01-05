/**
 * Pattern Knowledge Database
 *
 * Comprehensive phonics pattern intelligence with sound variations,
 * frequency data, and teaching sequences.
 *
 * Special focus on patterns with multiple sounds (ea, ow, oo, etc.)
 */

import { PatternKnowledge } from "./types.js";

export const PATTERN_DATABASE: Record<string, PatternKnowledge> = {
  // ============================================================================
  // VOWEL TEAMS (with multiple sound variations)
  // ============================================================================

  "ea": {
    pattern: "ea",
    type: "vowel_team",
    displayName: "Vowel Team 'ea'",
    sounds: [
      {
        pronunciation: "long 'e' (ee)",
        frequency: 70,
        examples: ["beach", "teach", "dream", "team", "sea", "read", "please", "east", "beast", "feast"],
        teachingNote: "This is the most common 'ea' sound - like the name of the letter E",
        gradeLevel: [1, 2],
        difficulty: 2,
      },
      {
        pronunciation: "short 'e' (eh)",
        frequency: 25,
        examples: ["bread", "head", "dead", "ready", "heavy", "spread", "thread", "instead", "breakfast", "weather"],
        teachingNote: "Less common but important - 'ea' sounds like the 'e' in 'bed'",
        gradeLevel: [2, 3],
        difficulty: 3,
      },
      {
        pronunciation: "long 'a' (ay)",
        frequency: 5,
        examples: ["break", "great", "steak"],
        teachingNote: "Rare exception - only 3 common words! These are sight words to memorize",
        gradeLevel: [3, 4],
        difficulty: 4,
      },
    ],
    relatedPatterns: [
      {
        pattern: "eau",
        pronunciation: "long 'o' (oh)",
        origin: "French loanwords",
        examples: ["beautiful", "bureau", "plateau", "tableau", "chateau"],
        teachingNote: "This is different from 'ea'! It's a 3-letter French pattern that says 'oh'",
        gradeLevel: [4, 5],
      },
      {
        pattern: "ee",
        pronunciation: "long 'e' (ee)",
        examples: ["tree", "see", "free", "green"],
        teachingNote: "'ee' almost always says long 'e', unlike 'ea' which has variations",
        gradeLevel: [1, 2],
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ea' → 'ee' sound", words: ["beach", "teach", "reach", "peach", "dream"], sound: "long 'e' (ee)" },
      { session: 2, focus: "Reinforce 'ea' → 'ee' with more words", words: ["team", "sea", "please", "east", "beast"], sound: "long 'e' (ee)" },
      { session: 3, focus: "Introduce 'ea' → 'eh' variation", words: ["bread", "head", "ready"], sound: "short 'e' (eh)" },
      { session: 4, focus: "Contrast the two sounds", words: ["beach vs bread", "team vs head"], notes: "Show that same letters make different sounds" },
      { session: 5, focus: "Practice both variations", words: ["dream", "heavy", "please", "weather", "feast"], notes: "Mix both sounds" },
      { session: 6, focus: "Introduce exceptions & French 'eau'", words: ["break", "great", "beautiful"], notes: "Explain these are special/rare" },
    ],
    commonMistakes: [
      "Spelling 'bread' as 'breed' (confusing ea sounds)",
      "Spelling 'beautiful' as 'beatiful' (not recognizing 'eau' pattern)",
    ],
    mnemonics: [
      "EAst coast beaches - 'ea' says 'ee'",
      "I'm READY for BREAD - 'ea' says 'eh'",
      "BEAUTIFUL has EAU from French",
    ],
  },

  "ee": {
    pattern: "ee",
    type: "vowel_team",
    displayName: "Vowel Team 'ee'",
    sounds: [
      {
        pronunciation: "long 'e' (ee)",
        frequency: 99,
        examples: ["tree", "see", "free", "green", "sleep", "feet", "meet", "week", "three", "cheese"],
        teachingNote: "'ee' almost always says long 'e' - very consistent!",
        gradeLevel: [1, 2],
        difficulty: 1,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ee' sound", words: ["tree", "see", "free"], sound: "long 'e' (ee)" },
      { session: 2, focus: "Practice 'ee' words", words: ["green", "sleep", "feet", "meet", "week"], sound: "long 'e' (ee)" },
    ],
    commonMistakes: [
      "Confusing 'ee' with 'ea' (both make long 'e' sound)",
    ],
    mnemonics: [
      "Two E's make the long 'e' EEEEE!",
    ],
  },

  "oo": {
    pattern: "oo",
    type: "vowel_team",
    displayName: "Vowel Team 'oo'",
    sounds: [
      {
        pronunciation: "long 'oo' (as in moon)",
        frequency: 60,
        examples: ["moon", "food", "cool", "school", "room", "soon", "zoo", "tool", "boot", "spoon"],
        teachingNote: "The long 'oo' sound like 'moooo' (cow sound)",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
      {
        pronunciation: "short 'oo' (as in book)",
        frequency: 40,
        examples: ["book", "look", "took", "cook", "good", "wood", "foot", "hood", "stood", "hook"],
        teachingNote: "The short 'oo' sound - less common but important",
        gradeLevel: [2, 3],
        difficulty: 3,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce long 'oo'", words: ["moon", "food", "cool", "school"], sound: "long 'oo' (as in moon)" },
      { session: 2, focus: "Introduce short 'oo'", words: ["book", "look", "took", "cook"], sound: "short 'oo' (as in book)" },
      { session: 3, focus: "Contrast both sounds", words: ["moon vs book", "food vs good"], notes: "Same letters, different sounds" },
    ],
    commonMistakes: [
      "Spelling 'book' as 'buk' (not recognizing 'oo' pattern)",
    ],
    mnemonics: [
      "The MOON says long 'oo'",
      "LOOK at the BOOK - short 'oo'",
    ],
  },

  "ow": {
    pattern: "ow",
    type: "vowel_team",
    displayName: "Vowel Team 'ow'",
    sounds: [
      {
        pronunciation: "long 'o' (oh)",
        frequency: 50,
        examples: ["snow", "grow", "show", "know", "slow", "throw", "yellow", "window", "bowl", "own"],
        teachingNote: "'ow' can say long 'o' like in 'snow'",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
      {
        pronunciation: "'ow' as in cow",
        frequency: 50,
        examples: ["cow", "now", "how", "down", "town", "brown", "flower", "power", "tower", "crowd"],
        teachingNote: "'ow' can also make the sound in 'cow' - OW!",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ow' → 'oh'", words: ["snow", "grow", "show"], sound: "long 'o' (oh)" },
      { session: 2, focus: "Introduce 'ow' → 'ow'", words: ["cow", "now", "how"], sound: "'ow' as in cow" },
      { session: 3, focus: "Practice distinguishing", words: ["snow vs cow", "show vs how"], notes: "Context helps determine sound" },
    ],
    commonMistakes: [
      "Confusing which 'ow' sound to use",
    ],
    mnemonics: [
      "The cow says OW!",
      "Let it SNOW - long 'o'",
    ],
  },

  // ============================================================================
  // CONSISTENT VOWEL TEAMS (single sound)
  // ============================================================================

  "ai": {
    pattern: "ai",
    type: "vowel_team",
    displayName: "Vowel Team 'ai'",
    sounds: [
      {
        pronunciation: "long 'a' (ay)",
        frequency: 100,
        examples: ["rain", "train", "pain", "wait", "mail", "tail", "sail", "paint", "afraid", "brain"],
        teachingNote: "'ai' almost always makes the long 'a' sound",
        gradeLevel: [1, 2],
        difficulty: 1,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ai' sound", words: ["rain", "train", "pain", "wait", "mail"], sound: "long 'a' (ay)" },
    ],
    mnemonics: ["When two vowels go walking, the first one does the talking! A says its name"],
  },

  "ay": {
    pattern: "ay",
    type: "vowel_team",
    displayName: "Vowel Team 'ay'",
    sounds: [
      {
        pronunciation: "long 'a' (ay)",
        frequency: 100,
        examples: ["day", "play", "say", "way", "may", "stay", "pay", "gray", "relay", "birthday"],
        teachingNote: "'ay' at the end of words makes the long 'a' sound",
        gradeLevel: [1, 2],
        difficulty: 1,
      },
    ],
    relatedPatterns: [
      {
        pattern: "ai",
        pronunciation: "long 'a' (ay)",
        examples: ["rain", "train"],
        teachingNote: "'ai' is used in the middle of words, 'ay' at the end",
        gradeLevel: [1, 2],
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ay' sound", words: ["day", "play", "say", "way", "may"], sound: "long 'a' (ay)" },
      { session: 2, focus: "Contrast with 'ai'", words: ["rain vs day", "train vs play"], notes: "'ai' middle, 'ay' end" },
    ],
    mnemonics: ["AY at the end of the day!"],
  },

  "oa": {
    pattern: "oa",
    type: "vowel_team",
    displayName: "Vowel Team 'oa'",
    sounds: [
      {
        pronunciation: "long 'o' (oh)",
        frequency: 100,
        examples: ["boat", "coat", "goat", "road", "soap", "toast", "coach", "float", "throat", "approach"],
        teachingNote: "'oa' makes the long 'o' sound",
        gradeLevel: [2, 3],
        difficulty: 1,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'oa' sound", words: ["boat", "coat", "goat", "road", "soap"], sound: "long 'o' (oh)" },
    ],
    mnemonics: ["Row your BOAT - 'oa' says 'oh'"],
  },

  // ============================================================================
  // DIGRAPHS
  // ============================================================================

  "sh": {
    pattern: "sh",
    type: "digraph",
    displayName: "Digraph 'sh'",
    sounds: [
      {
        pronunciation: "'sh' sound",
        frequency: 100,
        examples: ["ship", "fish", "wish", "shop", "brush", "crush", "shower", "shout", "finish", "mushroom"],
        teachingNote: "Two letters make one sound: SH (like saying 'be quiet')",
        gradeLevel: [1, 1],
        difficulty: 1,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'sh' sound", words: ["ship", "fish", "wish", "shop"], sound: "'sh' sound" },
    ],
    mnemonics: ["SH means be quiet!", "FISH in the ocean go 'shhhh'"],
  },

  "ch": {
    pattern: "ch",
    type: "digraph",
    displayName: "Digraph 'ch'",
    sounds: [
      {
        pronunciation: "'ch' sound",
        frequency: 90,
        examples: ["chip", "chat", "much", "lunch", "beach", "teacher", "kitchen", "chicken", "children", "chocolate"],
        teachingNote: "Two letters make one sound: CH (like a sneeze)",
        gradeLevel: [1, 1],
        difficulty: 1,
      },
      {
        pronunciation: "'k' sound",
        frequency: 10,
        examples: ["school", "echo", "chemistry", "character", "orchestra", "mechanic"],
        teachingNote: "In Greek-origin words, 'ch' sometimes makes the 'k' sound",
        gradeLevel: [4, 5],
        difficulty: 4,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ch' sound", words: ["chip", "chat", "much", "lunch"], sound: "'ch' sound" },
      { session: 2, focus: "Greek 'ch' = 'k'", words: ["school", "echo"], sound: "'k' sound", notes: "Advanced - Greek words" },
    ],
    mnemonics: ["CHOO-CHOO train!", "CHOCOLATE is so good - CH!"],
  },

  "th": {
    pattern: "th",
    type: "digraph",
    displayName: "Digraph 'th'",
    sounds: [
      {
        pronunciation: "voiced 'th' (as in 'this')",
        frequency: 50,
        examples: ["this", "that", "they", "them", "there", "the", "mother", "father", "brother", "weather"],
        teachingNote: "Voiced 'th' - your vocal cords vibrate (put hand on throat)",
        gradeLevel: [1, 2],
        difficulty: 2,
      },
      {
        pronunciation: "unvoiced 'th' (as in 'think')",
        frequency: 50,
        examples: ["think", "thank", "bath", "math", "tooth", "something", "nothing", "birthday", "months", "healthy"],
        teachingNote: "Unvoiced 'th' - just air, no vocal cord vibration",
        gradeLevel: [1, 2],
        difficulty: 2,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce both 'th' sounds", words: ["this", "think"], notes: "Feel the difference" },
      { session: 2, focus: "Practice voiced 'th'", words: ["that", "they", "them"], sound: "voiced 'th' (as in 'this')" },
      { session: 3, focus: "Practice unvoiced 'th'", words: ["thank", "bath", "math"], sound: "unvoiced 'th' (as in 'think')" },
    ],
    mnemonics: ["Put your tongue between your teeth for TH!"],
  },

  // ============================================================================
  // R-CONTROLLED VOWELS
  // ============================================================================

  "ar": {
    pattern: "ar",
    type: "r_controlled",
    displayName: "R-Controlled 'ar'",
    sounds: [
      {
        pronunciation: "'ar' sound (as in car)",
        frequency: 100,
        examples: ["car", "star", "far", "park", "dark", "farm", "hard", "shark", "party", "garden"],
        teachingNote: "The 'r' controls the vowel - 'a' doesn't say its name, it says 'ar'",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ar' sound", words: ["car", "star", "far", "park", "dark"], sound: "'ar' sound (as in car)" },
    ],
    mnemonics: ["STAR in your CAR - 'ar' sound"],
  },

  "er": {
    pattern: "er",
    type: "r_controlled",
    displayName: "R-Controlled 'er'",
    sounds: [
      {
        pronunciation: "'er' sound (as in her)",
        frequency: 100,
        examples: ["her", "term", "fern", "person", "water", "tiger", "summer", "winter", "teacher", "computer"],
        teachingNote: "The 'r' controls the vowel - sounds like 'ur' in 'fur'",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'er' sound", words: ["her", "term", "fern", "person"], sound: "'er' sound (as in her)" },
    ],
    mnemonics: ["HER TIGER says 'er'"],
  },

  "ir": {
    pattern: "ir",
    type: "r_controlled",
    displayName: "R-Controlled 'ir'",
    sounds: [
      {
        pronunciation: "'ir' sound (as in bird)",
        frequency: 100,
        examples: ["bird", "girl", "first", "third", "shirt", "skirt", "birthday", "circle", "dirty", "thirteen"],
        teachingNote: "Sounds like 'er' - same sound, different spelling",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
    ],
    relatedPatterns: [
      {
        pattern: "er",
        pronunciation: "'er' sound",
        examples: ["her", "teacher"],
        teachingNote: "'ir', 'er', and 'ur' all make the same sound!",
        gradeLevel: [2, 3],
      },
      {
        pattern: "ur",
        pronunciation: "'ur' sound",
        examples: ["fur", "turn"],
        teachingNote: "'ir', 'er', and 'ur' all make the same sound!",
        gradeLevel: [2, 3],
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce 'ir' sound", words: ["bird", "girl", "first", "shirt"], sound: "'ir' sound (as in bird)" },
      { session: 2, focus: "Compare with 'er' and 'ur'", words: ["bird vs her vs fur"], notes: "Same sound, different spellings" },
    ],
    mnemonics: ["The BIRD wore a SHIRT - 'ir' sound"],
  },

  // ============================================================================
  // SILENT LETTERS
  // ============================================================================

  "silent_e": {
    pattern: "silent_e",
    type: "silent_letter",
    displayName: "Silent E (Magic E)",
    sounds: [
      {
        pronunciation: "makes previous vowel long",
        frequency: 100,
        examples: ["make", "time", "hope", "use", "cake", "ride", "note", "cute", "smile", "brave"],
        teachingNote: "The 'e' is silent but makes the vowel say its name (magic e!)",
        gradeLevel: [1, 2],
        difficulty: 2,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce magic e with 'a'", words: ["make", "cake", "take"], notes: "cap → cape, mad → made" },
      { session: 2, focus: "Magic e with 'i'", words: ["time", "ride", "smile"], notes: "bit → bite, hid → hide" },
      { session: 3, focus: "Magic e with 'o'", words: ["hope", "note", "home"], notes: "hop → hope, not → note" },
    ],
    mnemonics: ["The magic E makes vowels say their names!"],
  },

  // ============================================================================
  // SUFFIXES
  // ============================================================================

  "-ing": {
    pattern: "-ing",
    type: "suffix",
    displayName: "Suffix '-ing'",
    sounds: [
      {
        pronunciation: "'ing' sound",
        frequency: 100,
        examples: ["running", "jumping", "playing", "reading", "singing", "walking", "talking", "sleeping", "eating", "writing"],
        teachingNote: "Added to verbs to show ongoing action",
        gradeLevel: [1, 2],
        difficulty: 1,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "Add '-ing' to simple verbs", words: ["run → running", "jump → jumping"], sound: "'ing' sound" },
      { session: 2, focus: "Drop silent e before '-ing'", words: ["make → making", "ride → riding"], notes: "Spelling rule" },
      { session: 3, focus: "Double consonant before '-ing'", words: ["run → running", "swim → swimming"], notes: "Spelling rule" },
    ],
    mnemonics: ["-ING means it's happening NOW"],
  },

  "-ed": {
    pattern: "-ed",
    type: "suffix",
    displayName: "Suffix '-ed'",
    sounds: [
      {
        pronunciation: "'ed' as /ed/",
        frequency: 20,
        examples: ["wanted", "needed", "started", "ended", "painted", "visited"],
        teachingNote: "After 't' or 'd', '-ed' makes its own syllable",
        gradeLevel: [2, 3],
        difficulty: 2,
      },
      {
        pronunciation: "'ed' as /t/",
        frequency: 40,
        examples: ["walked", "talked", "jumped", "helped", "looked", "asked"],
        teachingNote: "After voiceless sounds (p, k, s, sh, ch, f), '-ed' sounds like 't'",
        gradeLevel: [2, 3],
        difficulty: 3,
      },
      {
        pronunciation: "'ed' as /d/",
        frequency: 40,
        examples: ["played", "called", "opened", "closed", "rained", "cleaned"],
        teachingNote: "After voiced sounds (vowels, l, n, r, etc.), '-ed' sounds like 'd'",
        gradeLevel: [2, 3],
        difficulty: 3,
      },
    ],
    teachingSequence: [
      { session: 1, focus: "'-ed' as /ed/ (own syllable)", words: ["wanted", "needed", "started"], sound: "'ed' as /ed/" },
      { session: 2, focus: "'-ed' as /t/", words: ["walked", "jumped", "helped"], sound: "'ed' as /t/" },
      { session: 3, focus: "'-ed' as /d/", words: ["played", "called", "rained"], sound: "'ed' as /d/" },
    ],
    mnemonics: ["-ED shows it already happened (past tense)"],
  },

  "-tion": {
    pattern: "-tion",
    type: "suffix",
    displayName: "Suffix '-tion'",
    sounds: [
      {
        pronunciation: "'shun' sound",
        frequency: 100,
        examples: ["action", "nation", "station", "vacation", "question", "information", "education", "celebration"],
        teachingNote: "'-tion' always makes the 'shun' sound",
        gradeLevel: [3, 4],
        difficulty: 3,
      },
    ],
    commonMistakes: [
      "Spelling as '-shun' instead of '-tion'",
      "Confusing with '-sion' (which also says 'shun')",
    ],
    teachingSequence: [
      { session: 1, focus: "Introduce '-tion' = 'shun'", words: ["action", "nation", "station"], sound: "'shun' sound" },
    ],
    mnemonics: ["TION says 'shun' like VACATION!"],
  },
};

// Export list of all pattern keys for easy iteration
export const PATTERN_KEYS = Object.keys(PATTERN_DATABASE);

// Helper to get all patterns by category
export function getPatternsByCategory(category: string): PatternKnowledge[] {
  return Object.values(PATTERN_DATABASE).filter(p => p.type === category);
}

// Helper to get patterns by grade level
export function getPatternsByGrade(grade: number): PatternKnowledge[] {
  return Object.values(PATTERN_DATABASE).filter(p =>
    p.sounds.some(s => s.gradeLevel[0] <= grade && s.gradeLevel[1] >= grade)
  );
}
