/**
 * Pattern Knowledge System - Type Definitions
 *
 * Defines the structure for deep phonics intelligence with sound variations,
 * frequency data, and teaching sequences.
 */

export interface SoundVariation {
  /** Pronunciation description (e.g., "long 'e' (ee)") */
  pronunciation: string;

  /** Frequency percentage (e.g., 70 = 70% of words with this pattern use this sound) */
  frequency: number;

  /** Example words demonstrating this sound */
  examples: string[];

  /** Teaching note for educators/agent */
  teachingNote: string;

  /** Recommended grade levels for this variation */
  gradeLevel: [number, number]; // [min, max]

  /** Difficulty rating 1-5 */
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface RelatedPattern {
  /** Related pattern (e.g., "eau" related to "ea") */
  pattern: string;

  /** How it's pronounced */
  pronunciation: string;

  /** Origin explanation (e.g., "French loanwords") */
  origin?: string;

  /** Example words */
  examples: string[];

  /** Teaching note explaining the difference */
  teachingNote: string;

  /** Grade levels */
  gradeLevel: [number, number];
}

export interface TeachingStep {
  /** Session number in sequence */
  session: number;

  /** What to focus on this session */
  focus: string;

  /** Target words for practice */
  words: string[];

  /** Sound variation being taught (matches SoundVariation.pronunciation) */
  sound?: string;

  /** Additional teaching notes */
  notes?: string;
}

export interface PatternKnowledge {
  /** Pattern string (e.g., "ea", "sh", "-ing") */
  pattern: string;

  /** Pattern category */
  type: "vowel_team" | "digraph" | "blend" | "r_controlled" | "suffix" | "prefix" | "silent_letter" | "trigraph" | "special";

  /** Display name for UI */
  displayName: string;

  /** All possible sounds this pattern makes */
  sounds: SoundVariation[];

  /** Patterns related to or confused with this one */
  relatedPatterns?: RelatedPattern[];

  /** Recommended teaching sequence */
  teachingSequence: TeachingStep[];

  /** Common mistakes students make */
  commonMistakes?: string[];

  /** Memory tricks/mnemonics */
  mnemonics?: string[];
}

export interface PatternLookupResult {
  /** The pattern that was found */
  pattern: PatternKnowledge;

  /** Specific sound variation (if requested) */
  sound?: SoundVariation;

  /** Suggested words for practice */
  practiceWords: string[];

  /** Teaching recommendations */
  teachingTips: string[];
}

export type PatternCategory =
  | "vowel_team"
  | "digraph"
  | "blend"
  | "r_controlled"
  | "suffix"
  | "prefix"
  | "silent_letter"
  | "trigraph"
  | "special";

export interface PatternFilter {
  /** Filter by category */
  category?: PatternCategory;

  /** Filter by grade level */
  gradeLevel?: number;

  /** Filter by difficulty */
  difficulty?: 1 | 2 | 3 | 4 | 5;

  /** Only include patterns with multiple sounds */
  multipleVariations?: boolean;
}
