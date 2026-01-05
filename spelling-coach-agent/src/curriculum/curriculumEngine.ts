/**
 * Curriculum Engine
 *
 * Manages student progress through the curriculum, makes adaptive
 * recommendations, and tracks mastery levels.
 */

import { GRADE_2_CURRICULUM } from "./grade2.js";
import type {
  YearlyCurriculum,
  Unit,
  SessionPlan,
  CurriculumProgress,
  CurriculumRecommendation,
} from "./types.js";

export class CurriculumEngine {
  private curricula: Map<number, YearlyCurriculum> = new Map();

  constructor() {
    // Load all grade curricula
    this.curricula.set(2, GRADE_2_CURRICULUM);
    // TODO: Add grades 1, 3, 4, 5
  }

  /**
   * Get curriculum for a specific grade
   */
  getCurriculum(grade: number): YearlyCurriculum | null {
    return this.curricula.get(grade) || null;
  }

  /**
   * Get a specific unit from a curriculum
   */
  getUnit(grade: number, unitNumber: number): Unit | null {
    const curriculum = this.getCurriculum(grade);
    if (!curriculum) return null;

    return curriculum.units.find(u => u.unitNumber === unitNumber) || null;
  }

  /**
   * Get a specific session plan
   */
  getSessionPlan(grade: number, unitNumber: number, sessionNumber: number): SessionPlan | null {
    const unit = this.getUnit(grade, unitNumber);
    if (!unit) return null;

    return unit.sessionPlans.find(s => s.sessionNumber === sessionNumber) || null;
  }

  /**
   * Determine if student meets prerequisites for a unit
   */
  meetsPrerequisites(
    unit: Unit,
    patternMastery: Record<string, number>
  ): { meets: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const prereqPattern of unit.prerequisite.patterns) {
      const mastery = patternMastery[prereqPattern] || 0;
      if (mastery < unit.prerequisite.masteryRequired) {
        missing.push(prereqPattern);
      }
    }

    return {
      meets: missing.length === 0,
      missing,
    };
  }

  /**
   * Determine if student has completed a unit
   */
  hasCompletedUnit(
    unit: Unit,
    sessionsCompleted: number,
    patternMastery: Record<string, number>
  ): boolean {
    // Check minimum sessions requirement
    if (sessionsCompleted < unit.assessment.minSessionsRequired) {
      return false;
    }

    // Check mastery threshold for unit patterns
    // Extract all patterns taught in this unit
    const unitPatterns = new Set<string>();
    unit.sessionPlans.forEach(session => {
      session.lessonPlan.targetPatterns.forEach(tp => {
        unitPatterns.add(tp.pattern);
      });
    });

    // Calculate average mastery for unit patterns
    let totalMastery = 0;
    let patternCount = 0;

    unitPatterns.forEach(pattern => {
      const mastery = patternMastery[pattern] || 0;
      totalMastery += mastery;
      patternCount++;
    });

    const averageMastery = patternCount > 0 ? totalMastery / patternCount : 0;

    return averageMastery >= unit.assessment.masteryThreshold;
  }

  /**
   * Get recommendation for what student should do next
   */
  getRecommendation(
    progress: CurriculumProgress,
    recentAccuracy: number,
    lastSessionPatterns: string[]
  ): CurriculumRecommendation {
    const curriculum = this.getCurriculum(progress.grade);
    if (!curriculum) {
      throw new Error(`No curriculum found for grade ${progress.grade}`);
    }

    const currentUnit = this.getUnit(progress.grade, progress.currentUnit);
    if (!currentUnit) {
      throw new Error(`Unit ${progress.currentUnit} not found`);
    }

    // Check if struggling (accuracy < 60%)
    if (recentAccuracy < 0.6) {
      return this.handleStruggling(progress, currentUnit, lastSessionPatterns);
    }

    // Check if mastering (accuracy > 90%)
    if (recentAccuracy > 0.9) {
      return this.handleMastering(progress, currentUnit, curriculum);
    }

    // Normal progress - continue with next session
    return this.handleNormalProgress(progress, currentUnit, curriculum);
  }

  /**
   * Handle case where student is struggling
   */
  private handleStruggling(
    progress: CurriculumProgress,
    unit: Unit,
    lastSessionPatterns: string[]
  ): CurriculumRecommendation {
    // Find weakest pattern from last session
    let weakestPattern = "";
    let lowestMastery = 1.0;

    lastSessionPatterns.forEach(pattern => {
      const mastery = progress.patternMastery[pattern] || 0;
      if (mastery < lowestMastery) {
        lowestMastery = mastery;
        weakestPattern = pattern;
      }
    });

    // Recommend reviewing the current session or going back
    const currentSession = this.getSessionPlan(
      progress.grade,
      progress.currentUnit,
      progress.currentSession
    );

    if (currentSession) {
      return {
        nextFocus: `Review ${weakestPattern} pattern - student needs more practice`,
        recommendedSession: currentSession, // Repeat current session
        reasoning: `Student is struggling (accuracy < 60%). Focusing on ${weakestPattern} pattern which has ${(lowestMastery * 100).toFixed(0)}% mastery.`,
        estimatedSessionsRemaining: unit.duration - progress.currentSession + 2, // Add extra sessions
      };
    }

    // Fallback
    return this.handleNormalProgress(progress, unit, this.getCurriculum(progress.grade)!);
  }

  /**
   * Handle case where student is mastering content
   */
  private handleMastering(
    progress: CurriculumProgress,
    unit: Unit,
    curriculum: YearlyCurriculum
  ): CurriculumRecommendation {
    // Check if unit is complete
    const unitComplete = this.hasCompletedUnit(
      unit,
      progress.currentSession,
      progress.patternMastery
    );

    if (unitComplete) {
      // Move to next unit
      const nextUnit = this.getUnit(progress.grade, progress.currentUnit + 1);

      if (nextUnit) {
        const firstSession = nextUnit.sessionPlans[0];

        return {
          nextFocus: `Begin ${nextUnit.name}`,
          recommendedSession: firstSession,
          reasoning: `Student has mastered Unit ${unit.unitNumber}! Moving to next unit.`,
          estimatedSessionsRemaining: nextUnit.duration,
        };
      } else {
        // Completed all units!
        return {
          nextFocus: "Congratulations! Curriculum complete!",
          recommendedSession: unit.sessionPlans[unit.sessionPlans.length - 1], // Last session as placeholder
          reasoning: `Student has completed all ${curriculum.units.length} units for Grade ${progress.grade}!`,
          estimatedSessionsRemaining: 0,
        };
      }
    }

    // Not complete yet, but doing well - skip ahead?
    const nextSessionNumber = progress.currentSession + 2; // Skip one
    const nextSession = this.getSessionPlan(
      progress.grade,
      progress.currentUnit,
      Math.min(nextSessionNumber, unit.sessionPlans.length)
    );

    if (nextSession) {
      return {
        nextFocus: `Advance to ${nextSession.lessonPlan.focus}`,
        recommendedSession: nextSession,
        reasoning: `Student is excelling (accuracy > 90%). Accelerating progress by skipping ahead.`,
        estimatedSessionsRemaining: Math.max(unit.duration - nextSessionNumber, 1),
      };
    }

    return this.handleNormalProgress(progress, unit, curriculum);
  }

  /**
   * Handle normal progress (60-90% accuracy)
   */
  private handleNormalProgress(
    progress: CurriculumProgress,
    unit: Unit,
    curriculum: YearlyCurriculum
  ): CurriculumRecommendation {
    // Move to next session in sequence
    const nextSessionNumber = progress.currentSession + 1;
    const nextSession = this.getSessionPlan(
      progress.grade,
      progress.currentUnit,
      nextSessionNumber
    );

    if (nextSession) {
      return {
        nextFocus: nextSession.lessonPlan.focus,
        recommendedSession: nextSession,
        reasoning: `Student is making good progress. Continuing with planned curriculum.`,
        estimatedSessionsRemaining: unit.duration - nextSessionNumber + 1,
      };
    }

    // End of unit - check if ready for next
    const unitComplete = this.hasCompletedUnit(
      unit,
      progress.currentSession,
      progress.patternMastery
    );

    if (unitComplete) {
      const nextUnit = this.getUnit(progress.grade, progress.currentUnit + 1);

      if (nextUnit) {
        const firstSession = nextUnit.sessionPlans[0];

        return {
          nextFocus: `Begin ${nextUnit.name}`,
          recommendedSession: firstSession,
          reasoning: `Unit ${unit.unitNumber} complete. Starting next unit.`,
          estimatedSessionsRemaining: nextUnit.duration,
        };
      }
    }

    // Need more practice in current unit
    const lastSession = unit.sessionPlans[unit.sessionPlans.length - 1];

    return {
      nextFocus: `Additional practice for ${unit.name}`,
      recommendedSession: lastSession, // Repeat last session
      reasoning: `Student needs more practice to meet unit mastery threshold (${(unit.assessment.masteryThreshold * 100).toFixed(0)}%).`,
      estimatedSessionsRemaining: 2,
    };
  }

  /**
   * Initialize progress for a new student
   */
  createNewProgress(studentId: string, grade: number): CurriculumProgress {
    return {
      studentId,
      grade,
      currentUnit: 1,
      currentSession: 1,
      totalSessionsCompleted: 0,
      patternMastery: {},
      wordsLearned: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Update progress after a session
   */
  updateProgress(
    progress: CurriculumProgress,
    sessionResults: {
      correctWords: string[];
      incorrectWords: string[];
      patternAccuracy: Record<string, number>; // pattern -> accuracy (0-1)
    }
  ): CurriculumProgress {
    // Update words learned
    sessionResults.correctWords.forEach(word => {
      if (!progress.wordsLearned.includes(word)) {
        progress.wordsLearned.push(word);
      }
    });

    // Update pattern mastery (exponential moving average)
    const alpha = 0.3; // Weight for new data
    Object.entries(sessionResults.patternAccuracy).forEach(([pattern, accuracy]) => {
      const currentMastery = progress.patternMastery[pattern] || 0;
      progress.patternMastery[pattern] = currentMastery * (1 - alpha) + accuracy * alpha;
    });

    // Increment session counter
    progress.totalSessionsCompleted++;

    // Update timestamp
    progress.lastUpdated = new Date().toISOString();

    return progress;
  }

  /**
   * Advance to next session (called by agent after session complete)
   */
  advanceToNextSession(
    progress: CurriculumProgress,
    recommendation: CurriculumRecommendation
  ): CurriculumProgress {
    // Update current session based on recommendation
    const recommendedUnit = this.findUnitContainingSession(
      progress.grade,
      recommendation.recommendedSession
    );

    if (recommendedUnit) {
      progress.currentUnit = recommendedUnit.unitNumber;
      progress.currentSession = recommendation.recommendedSession.sessionNumber;
    }

    progress.lastUpdated = new Date().toISOString();

    return progress;
  }

  /**
   * Helper: Find which unit contains a session
   */
  private findUnitContainingSession(grade: number, session: SessionPlan): Unit | null {
    const curriculum = this.getCurriculum(grade);
    if (!curriculum) return null;

    return curriculum.units.find(unit =>
      unit.sessionPlans.some(s => s.sessionNumber === session.sessionNumber)
    ) || null;
  }
}

// Export singleton instance
export const curriculumEngine = new CurriculumEngine();
