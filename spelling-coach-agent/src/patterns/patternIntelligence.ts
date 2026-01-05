/**
 * Pattern Intelligence Service
 *
 * Provides smart pattern lookup with teaching recommendations,
 * sound variation detection, and context-aware suggestions.
 */

import { PATTERN_DATABASE } from "./patternKnowledge.js";
import type { PatternKnowledge, SoundVariation, PatternLookupResult, PatternFilter } from "./types.js";

export class PatternIntelligence {
  /**
   * Get complete knowledge about a pattern
   */
  getPattern(pattern: string): PatternKnowledge | null {
    return PATTERN_DATABASE[pattern] || null;
  }

  /**
   * Find which sound variation a word uses
   */
  identifySound(pattern: string, word: string): SoundVariation | null {
    const patternKnowledge = this.getPattern(pattern);
    if (!patternKnowledge) return null;

    // Find which sound variation this word belongs to
    for (const sound of patternKnowledge.sounds) {
      if (sound.examples.includes(word.toLowerCase())) {
        return sound;
      }
    }

    // If word not in examples, return most common sound (highest frequency)
    return patternKnowledge.sounds.sort((a, b) => b.frequency - a.frequency)[0];
  }

  /**
   * Get practice words for a specific sound variation
   */
  getPracticeWords(
    pattern: string,
    sound?: string,
    count: number = 5,
    difficulty?: 1 | 2 | 3 | 4 | 5
  ): string[] {
    const patternKnowledge = this.getPattern(pattern);
    if (!patternKnowledge) return [];

    // If specific sound requested, get examples from that variation
    if (sound) {
      const soundVariation = patternKnowledge.sounds.find(s => s.pronunciation === sound);
      if (soundVariation) {
        let words = soundVariation.examples;

        // Filter by difficulty if specified
        if (difficulty && soundVariation.difficulty !== difficulty) {
          // If requested difficulty doesn't match, try to find words from other variations with that difficulty
          words = patternKnowledge.sounds
            .filter(s => s.difficulty === difficulty)
            .flatMap(s => s.examples);
        }

        // Shuffle and return requested count
        return this.shuffleArray(words).slice(0, count);
      }
    }

    // Otherwise, get examples from most common sound
    const mostCommonSound = patternKnowledge.sounds.sort((a, b) => b.frequency - a.frequency)[0];
    return this.shuffleArray(mostCommonSound.examples).slice(0, count);
  }

  /**
   * Get teaching recommendations for a pattern
   */
  getTeachingRecommendations(pattern: string, studentGrade: number): string[] {
    const patternKnowledge = this.getPattern(pattern);
    if (!patternKnowledge) return [];

    const recommendations: string[] = [];

    // Get sounds appropriate for this grade level
    const appropriateSounds = patternKnowledge.sounds.filter(
      s => s.gradeLevel[0] <= studentGrade && s.gradeLevel[1] >= studentGrade
    );

    if (appropriateSounds.length === 0) {
      recommendations.push(`Pattern '${pattern}' may be too advanced for grade ${studentGrade}`);
      return recommendations;
    }

    // Recommend starting with most common sound
    const mostCommon = appropriateSounds.sort((a, b) => b.frequency - a.frequency)[0];
    recommendations.push(
      `Start with the most common sound: ${mostCommon.pronunciation} (${mostCommon.frequency}% frequency)`
    );
    recommendations.push(mostCommon.teachingNote);

    // If multiple sounds, suggest teaching sequence
    if (patternKnowledge.sounds.length > 1) {
      recommendations.push(
        `Note: This pattern has ${patternKnowledge.sounds.length} different sounds. ` +
        `Teach the common sound first, then introduce variations.`
      );
    }

    // Add related patterns info
    if (patternKnowledge.relatedPatterns && patternKnowledge.relatedPatterns.length > 0) {
      const relatedForGrade = patternKnowledge.relatedPatterns.filter(
        rp => rp.gradeLevel[0] <= studentGrade && rp.gradeLevel[1] >= studentGrade
      );

      if (relatedForGrade.length > 0) {
        recommendations.push(
          `Related patterns to teach: ${relatedForGrade.map(rp => rp.pattern).join(", ")}`
        );
      }
    }

    // Add mnemonics if available
    if (patternKnowledge.mnemonics && patternKnowledge.mnemonics.length > 0) {
      recommendations.push(`Memory tricks: ${patternKnowledge.mnemonics.join(", ")}`);
    }

    return recommendations;
  }

  /**
   * Suggest next teaching step in the sequence
   */
  getNextTeachingStep(pattern: string, currentSession: number): {
    session: number;
    focus: string;
    words: string[];
    notes?: string;
  } | null {
    const patternKnowledge = this.getPattern(pattern);
    if (!patternKnowledge || !patternKnowledge.teachingSequence) return null;

    const nextStep = patternKnowledge.teachingSequence.find(
      step => step.session === currentSession
    );

    return nextStep || null;
  }

  /**
   * Compare two patterns (for teaching contrasts)
   */
  comparePatterns(pattern1: string, pattern2: string): {
    similarities: string[];
    differences: string[];
    teachingNotes: string[];
  } {
    const p1 = this.getPattern(pattern1);
    const p2 = this.getPattern(pattern2);

    const result = {
      similarities: [] as string[],
      differences: [] as string[],
      teachingNotes: [] as string[],
    };

    if (!p1 || !p2) {
      result.teachingNotes.push("One or both patterns not found in database");
      return result;
    }

    // Check if they share sounds
    const p1Sounds = p1.sounds.map(s => s.pronunciation);
    const p2Sounds = p2.sounds.map(s => s.pronunciation);
    const sharedSounds = p1Sounds.filter(s => p2Sounds.includes(s));

    if (sharedSounds.length > 0) {
      result.similarities.push(`Both can make these sounds: ${sharedSounds.join(", ")}`);
    }

    // Check if they're related
    const p1RelatedToP2 = p1.relatedPatterns?.some(rp => rp.pattern === pattern2);
    const p2RelatedToP1 = p2.relatedPatterns?.some(rp => rp.pattern === pattern1);

    if (p1RelatedToP2 || p2RelatedToP1) {
      result.similarities.push("These patterns are related!");
      const relation = p1.relatedPatterns?.find(rp => rp.pattern === pattern2) ||
                      p2.relatedPatterns?.find(rp => rp.pattern === pattern1);
      if (relation?.teachingNote) {
        result.teachingNotes.push(relation.teachingNote);
      }
    }

    // Highlight key differences
    if (p1.sounds.length !== p2.sounds.length) {
      result.differences.push(
        `'${pattern1}' has ${p1.sounds.length} sound(s), '${pattern2}' has ${p2.sounds.length} sound(s)`
      );
    }

    if (p1.type !== p2.type) {
      result.differences.push(
        `'${pattern1}' is a ${p1.type}, '${pattern2}' is a ${p2.type}`
      );
    }

    // Teaching recommendations
    if (sharedSounds.length > 0) {
      result.teachingNotes.push(
        `Help students understand when to use each pattern for the same sound`
      );
    }

    return result;
  }

  /**
   * Get all patterns matching a filter
   */
  findPatterns(filter: PatternFilter): PatternKnowledge[] {
    let patterns = Object.values(PATTERN_DATABASE);

    if (filter.category) {
      patterns = patterns.filter(p => p.type === filter.category);
    }

    if (filter.gradeLevel) {
      patterns = patterns.filter(p =>
        p.sounds.some(s =>
          s.gradeLevel[0] <= filter.gradeLevel! && s.gradeLevel[1] >= filter.gradeLevel!
        )
      );
    }

    if (filter.difficulty) {
      patterns = patterns.filter(p =>
        p.sounds.some(s => s.difficulty === filter.difficulty)
      );
    }

    if (filter.multipleVariations) {
      patterns = patterns.filter(p => p.sounds.length > 1);
    }

    return patterns;
  }

  /**
   * Detect if a word contains a pattern and which sound it uses
   */
  analyzeWord(word: string): {
    pattern: string;
    sound: SoundVariation;
    confidence: "high" | "medium" | "low";
  }[] {
    const results: {
      pattern: string;
      sound: SoundVariation;
      confidence: "high" | "medium" | "low";
    }[] = [];

    const normalizedWord = word.toLowerCase();

    // Check each pattern
    for (const [patternKey, patternData] of Object.entries(PATTERN_DATABASE)) {
      // Skip suffix patterns for now (need different detection logic)
      if (patternData.type === "suffix") continue;

      // Check if word contains the pattern
      if (normalizedWord.includes(patternKey)) {
        // Find which sound variation
        for (const sound of patternData.sounds) {
          if (sound.examples.includes(normalizedWord)) {
            results.push({
              pattern: patternKey,
              sound: sound,
              confidence: "high", // Word is in examples list
            });
            break;
          }
        }

        // If not in examples, assume most common sound with lower confidence
        if (!results.some(r => r.pattern === patternKey)) {
          const mostCommonSound = patternData.sounds.sort((a, b) => b.frequency - a.frequency)[0];
          results.push({
            pattern: patternKey,
            sound: mostCommonSound,
            confidence: "medium",
          });
        }
      }
    }

    return results;
  }

  /**
   * Generate a complete pattern lookup with teaching tips
   */
  lookupPattern(
    pattern: string,
    studentGrade: number,
    strugglingWithSound?: string
  ): PatternLookupResult | null {
    const patternKnowledge = this.getPattern(pattern);
    if (!patternKnowledge) return null;

    let targetSound: SoundVariation | undefined;

    if (strugglingWithSound) {
      targetSound = patternKnowledge.sounds.find(s => s.pronunciation === strugglingWithSound);
    } else {
      // Get most common sound for this grade
      const gradeSounds = patternKnowledge.sounds.filter(
        s => s.gradeLevel[0] <= studentGrade && s.gradeLevel[1] >= studentGrade
      );
      targetSound = gradeSounds.sort((a, b) => b.frequency - a.frequency)[0];
    }

    const practiceWords = this.getPracticeWords(
      pattern,
      targetSound?.pronunciation,
      8
    );

    const teachingTips = this.getTeachingRecommendations(pattern, studentGrade);

    return {
      pattern: patternKnowledge,
      sound: targetSound,
      practiceWords,
      teachingTips,
    };
  }

  /**
   * Helper: Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export const patternIntelligence = new PatternIntelligence();
