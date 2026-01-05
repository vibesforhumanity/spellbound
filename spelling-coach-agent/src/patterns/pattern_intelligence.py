"""
Pattern Intelligence Service

Provides smart pattern lookup with teaching recommendations,
sound variation detection, and context-aware suggestions.
"""

import random
from typing import Optional, List
from .pattern_knowledge import PATTERN_DATABASE
from .types import (
    PatternKnowledge,
    SoundVariation,
    PatternLookupResult,
    PatternFilter,
)


class PatternIntelligence:
    """Smart pattern lookup and analysis service"""

    def get_pattern(self, pattern: str) -> Optional[PatternKnowledge]:
        """Get complete knowledge about a pattern"""
        return PATTERN_DATABASE.get(pattern)

    def identify_sound(self, pattern: str, word: str) -> Optional[SoundVariation]:
        """Find which sound variation a word uses"""
        pattern_knowledge = self.get_pattern(pattern)
        if not pattern_knowledge:
            return None

        word_lower = word.lower()

        # Find which sound variation this word belongs to
        for sound in pattern_knowledge.sounds:
            if word_lower in [ex.lower() for ex in sound.examples]:
                return sound

        # If word not in examples, return most common sound (highest frequency)
        return max(pattern_knowledge.sounds, key=lambda s: s.frequency)

    def get_practice_words(
        self,
        pattern: str,
        sound: Optional[str] = None,
        count: int = 5,
        difficulty: Optional[int] = None,
    ) -> List[str]:
        """Get practice words for a specific sound variation"""
        pattern_knowledge = self.get_pattern(pattern)
        if not pattern_knowledge:
            return []

        # If specific sound requested, get examples from that variation
        if sound:
            sound_variation = next(
                (s for s in pattern_knowledge.sounds if s.pronunciation == sound),
                None,
            )
            if sound_variation:
                words = sound_variation.examples.copy()

                # Filter by difficulty if specified
                if difficulty and sound_variation.difficulty != difficulty:
                    # Try to find words from other variations with that difficulty
                    words = [
                        ex
                        for s in pattern_knowledge.sounds
                        if s.difficulty == difficulty
                        for ex in s.examples
                    ]

                # Shuffle and return requested count
                random.shuffle(words)
                return words[:count]

        # Otherwise, get examples from most common sound
        most_common_sound = max(pattern_knowledge.sounds, key=lambda s: s.frequency)
        words = most_common_sound.examples.copy()
        random.shuffle(words)
        return words[:count]

    def get_teaching_recommendations(
        self, pattern: str, student_grade: int
    ) -> List[str]:
        """Get teaching recommendations for a pattern"""
        pattern_knowledge = self.get_pattern(pattern)
        if not pattern_knowledge:
            return []

        recommendations = []

        # Get sounds appropriate for this grade level
        appropriate_sounds = [
            s
            for s in pattern_knowledge.sounds
            if s.grade_level[0] <= student_grade <= s.grade_level[1]
        ]

        if not appropriate_sounds:
            recommendations.append(
                f"Pattern '{pattern}' may be too advanced for grade {student_grade}"
            )
            return recommendations

        # Recommend starting with most common sound
        most_common = max(appropriate_sounds, key=lambda s: s.frequency)
        recommendations.append(
            f"Start with the most common sound: {most_common.pronunciation} ({most_common.frequency}% frequency)"
        )
        recommendations.append(most_common.teaching_note)

        # If multiple sounds, suggest teaching sequence
        if len(pattern_knowledge.sounds) > 1:
            recommendations.append(
                f"Note: This pattern has {len(pattern_knowledge.sounds)} different sounds. "
                "Teach the common sound first, then introduce variations."
            )

        # Add related patterns info
        if pattern_knowledge.related_patterns:
            related_for_grade = [
                rp
                for rp in pattern_knowledge.related_patterns
                if rp.grade_level[0] <= student_grade <= rp.grade_level[1]
            ]

            if related_for_grade:
                recommendations.append(
                    f"Related patterns to teach: {', '.join(rp.pattern for rp in related_for_grade)}"
                )

        # Add mnemonics if available
        if pattern_knowledge.mnemonics:
            recommendations.append(
                f"Memory tricks: {', '.join(pattern_knowledge.mnemonics)}"
            )

        return recommendations

    def compare_patterns(
        self, pattern1: str, pattern2: str
    ) -> dict[str, List[str]]:
        """Compare two patterns for teaching contrasts"""
        p1 = self.get_pattern(pattern1)
        p2 = self.get_pattern(pattern2)

        result = {
            "similarities": [],
            "differences": [],
            "teaching_notes": [],
        }

        if not p1 or not p2:
            result["teaching_notes"].append("One or both patterns not found in database")
            return result

        # Check if they share sounds
        p1_sounds = {s.pronunciation for s in p1.sounds}
        p2_sounds = {s.pronunciation for s in p2.sounds}
        shared_sounds = p1_sounds & p2_sounds

        if shared_sounds:
            result["similarities"].append(
                f"Both can make these sounds: {', '.join(shared_sounds)}"
            )

        # Check if they're related
        p1_related_to_p2 = any(
            rp.pattern == pattern2 for rp in (p1.related_patterns or [])
        )
        p2_related_to_p1 = any(
            rp.pattern == pattern1 for rp in (p2.related_patterns or [])
        )

        if p1_related_to_p2 or p2_related_to_p1:
            result["similarities"].append("These patterns are related!")
            relation = next(
                (
                    rp
                    for rp in (p1.related_patterns or [])
                    if rp.pattern == pattern2
                ),
                None,
            ) or next(
                (
                    rp
                    for rp in (p2.related_patterns or [])
                    if rp.pattern == pattern1
                ),
                None,
            )
            if relation:
                result["teaching_notes"].append(relation.teaching_note)

        # Highlight key differences
        if len(p1.sounds) != len(p2.sounds):
            result["differences"].append(
                f"'{pattern1}' has {len(p1.sounds)} sound(s), '{pattern2}' has {len(p2.sounds)} sound(s)"
            )

        if p1.type != p2.type:
            result["differences"].append(
                f"'{pattern1}' is a {p1.type}, '{pattern2}' is a {p2.type}"
            )

        # Teaching recommendations
        if shared_sounds:
            result["teaching_notes"].append(
                "Help students understand when to use each pattern for the same sound"
            )

        return result

    def analyze_word(self, word: str) -> List[dict]:
        """Detect patterns in a word and which sounds they use"""
        results = []
        word_lower = word.lower()

        # Check each pattern
        for pattern_key, pattern_data in PATTERN_DATABASE.items():
            # Skip suffix patterns for now (need different detection logic)
            if pattern_data.type == "suffix":
                continue

            # Check if word contains the pattern
            if pattern_key in word_lower:
                # Find which sound variation
                sound = self.identify_sound(pattern_key, word)
                if sound:
                    results.append({
                        "pattern": pattern_key,
                        "sound": sound,
                        "confidence": "high" if word_lower in [ex.lower() for ex in sound.examples] else "medium",
                    })

        return results

    def lookup_pattern(
        self,
        pattern: str,
        student_grade: int,
        struggling_with_sound: Optional[str] = None,
    ) -> Optional[PatternLookupResult]:
        """Generate a complete pattern lookup with teaching tips"""
        pattern_knowledge = self.get_pattern(pattern)
        if not pattern_knowledge:
            return None

        target_sound = None

        if struggling_with_sound:
            target_sound = next(
                (
                    s
                    for s in pattern_knowledge.sounds
                    if s.pronunciation == struggling_with_sound
                ),
                None,
            )
        else:
            # Get most common sound for this grade
            grade_sounds = [
                s
                for s in pattern_knowledge.sounds
                if s.grade_level[0] <= student_grade <= s.grade_level[1]
            ]
            if grade_sounds:
                target_sound = max(grade_sounds, key=lambda s: s.frequency)

        practice_words = self.get_practice_words(
            pattern, target_sound.pronunciation if target_sound else None, 8
        )

        teaching_tips = self.get_teaching_recommendations(pattern, student_grade)

        return PatternLookupResult(
            pattern=pattern_knowledge,
            sound=target_sound,
            practice_words=practice_words,
            teaching_tips=teaching_tips,
        )


# Export singleton instance
pattern_intelligence = PatternIntelligence()
