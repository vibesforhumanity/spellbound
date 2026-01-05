"""
Pattern Knowledge System - Type Definitions

Defines Pydantic models for phonics patterns, sound variations, and teaching sequences.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class SoundVariation(BaseModel):
    """A specific sound variation for a phonics pattern"""

    pronunciation: str = Field(..., description="How this variation sounds (e.g., 'long e')")
    frequency: int = Field(..., ge=0, le=100, description="Percentage frequency (0-100)")
    examples: List[str] = Field(..., description="Example words using this sound")
    teaching_note: str = Field(..., description="Teaching tip for this variation")
    grade_level: tuple[int, int] = Field(..., description="Grade range [min, max]")
    difficulty: Literal[1, 2, 3, 4, 5] = Field(..., description="Difficulty level 1-5")


class RelatedPattern(BaseModel):
    """A related phonics pattern that should be taught together or contrasted"""

    pattern: str = Field(..., description="The related pattern")
    relationship: str = Field(..., description="How it relates (contrast, similar, prerequisite)")
    teaching_note: str = Field(..., description="Note about teaching these together")
    grade_level: tuple[int, int] = Field(..., description="Grade range [min, max]")


class TeachingStep(BaseModel):
    """A step in the teaching sequence for a pattern"""

    session: int = Field(..., description="Session number in sequence")
    focus: str = Field(..., description="What to focus on this session")
    words: List[str] = Field(..., description="Practice words for this session")
    notes: Optional[str] = Field(None, description="Additional teaching notes")


class PatternKnowledge(BaseModel):
    """Complete knowledge about a phonics pattern"""

    pattern: str = Field(..., description="The pattern (e.g., 'ea', 'sh', '-ing')")
    type: Literal[
        "vowel_team",
        "digraph",
        "blend",
        "r_controlled",
        "suffix",
        "prefix",
        "silent_letter",
        "diphthong",
        "trigraph"
    ] = Field(..., description="Pattern category")
    display_name: str = Field(..., description="Human-readable name")
    sounds: List[SoundVariation] = Field(..., description="All sound variations")
    related_patterns: Optional[List[RelatedPattern]] = Field(None, description="Related patterns")
    teaching_sequence: List[TeachingStep] = Field(..., description="Ordered teaching steps")
    common_mistakes: Optional[List[str]] = Field(None, description="Common student errors")
    mnemonics: Optional[List[str]] = Field(None, description="Memory aids")


class PatternFilter(BaseModel):
    """Filter criteria for finding patterns"""

    category: Optional[str] = None
    grade_level: Optional[int] = None
    difficulty: Optional[Literal[1, 2, 3, 4, 5]] = None
    multiple_variations: Optional[bool] = None


class PatternLookupResult(BaseModel):
    """Result of a pattern lookup with teaching context"""

    pattern: PatternKnowledge
    sound: Optional[SoundVariation] = None
    practice_words: List[str]
    teaching_tips: List[str]
