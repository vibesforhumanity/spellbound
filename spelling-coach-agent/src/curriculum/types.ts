/**
 * Curriculum System - Type Definitions
 *
 * Defines the structure for yearly curricula, units, and session plans.
 */

export interface YearlyCurriculum {
  /** Grade level (1-5) */
  grade: 1 | 2 | 3 | 4 | 5;

  /** Yearly learning objectives */
  objectives: string[];

  /** All units for the year (typically 30-36 weeks) */
  units: Unit[];

  /** Prerequisite skills for this grade */
  prerequisites?: string[];

  /** Target vocabulary size by end of year */
  targetVocabularySize: number;
}

export interface Unit {
  /** Unit number in sequence */
  unitNumber: number;

  /** Unit name/theme */
  name: string;

  /** Duration in sessions (typically 4-6 sessions = 1-2 weeks) */
  duration: number;

  /** Prerequisites for this unit */
  prerequisite: {
    /** Patterns that should be mastered */
    patterns: string[];

    /** Required mastery level (0-1) */
    masteryRequired: number;
  };

  /** Learning goals for this unit */
  learningGoals: string[];

  /** Session plans for this unit */
  sessionPlans: SessionPlan[];

  /** Assessment criteria for unit completion */
  assessment: {
    /** Mastery threshold (0-1) */
    masteryThreshold: number;

    /** Minimum sessions required */
    minSessionsRequired: number;

    /** Exit criteria description */
    exitCriteria: string;
  };
}

export interface SessionPlan {
  /** Session number within the unit */
  sessionNumber: number;

  /** Detailed lesson plan */
  lessonPlan: {
    /** Focus/theme of this session */
    focus: string;

    /** Target patterns to practice */
    targetPatterns: TargetPattern[];

    /** New vocabulary words to introduce */
    vocabularyGoals: string[];

    /** Activity mix for this session */
    activities: Activity[];

    /** Criteria to move to next session */
    exitCriteria: {
      /** Minimum correct out of total words */
      minimumCorrect: number;

      /** Pattern mastery level required (0-1) */
      patternMastery: number;
    };
  };

  /** Adaptive branching based on student performance */
  adaptiveBranching: {
    /** What to do if student is struggling */
    ifStruggling: {
      action: string;
      nextSession: string;
    };

    /** What to do if student is excelling */
    ifMastering: {
      action: string;
      nextSession: string;
    };
  };
}

export interface TargetPattern {
  /** Pattern key (matches pattern knowledge database) */
  pattern: string;

  /** Specific sound if pattern has variations */
  sound?: string;

  /** Example words for this pattern/sound */
  examples: string[];
}

export interface Activity {
  /** Template type */
  template: "listenAndSpell" | "patternDetective" | "multipleChoice" | "wordBuilder";

  /** Number of questions/words for this activity */
  count: number;

  /** Additional parameters */
  difficulty?: "easy" | "medium" | "hard";
  reinforcement?: boolean;
  reviewWords?: string[];
  challenge?: string;
}

export interface CurriculumProgress {
  /** Student ID */
  studentId: string;

  /** Current grade */
  grade: number;

  /** Current unit number */
  currentUnit: number;

  /** Current session within unit */
  currentSession: number;

  /** Total sessions completed */
  totalSessionsCompleted: number;

  /** Pattern mastery levels */
  patternMastery: Record<string, number>; // pattern -> mastery (0-1)

  /** Words learned */
  wordsLearned: string[];

  /** Last updated */
  lastUpdated: string; // ISO timestamp
}

export interface CurriculumRecommendation {
  /** What the student should focus on next */
  nextFocus: string;

  /** Recommended session plan */
  recommendedSession: SessionPlan;

  /** Reasoning for this recommendation */
  reasoning: string;

  /** Estimated sessions until unit completion */
  estimatedSessionsRemaining: number;
}
