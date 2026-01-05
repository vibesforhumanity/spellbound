"""
Curriculum System - Type Definitions

Defines Pydantic models for yearly curricula, units, and session plans.
"""

from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class TargetPattern(BaseModel):
    """A specific pattern to practice in a session"""

    pattern: str = Field(..., description="Pattern key (e.g., 'ea', 'sh')")
    sound: Optional[str] = Field(None, description="Specific sound variation")
    examples: List[str] = Field(..., description="Example words")


class Activity(BaseModel):
    """An activity template for a session"""

    template: Literal[
        "listenAndSpell", "patternDetective", "multipleChoice", "wordBuilder"
    ] = Field(..., description="Template type")
    count: int = Field(..., description="Number of questions/words")
    difficulty: Optional[Literal["easy", "medium", "hard"]] = None
    reinforcement: Optional[bool] = None
    review_words: Optional[List[str]] = None
    challenge: Optional[str] = None


class AdaptiveBranching(BaseModel):
    """Adaptive branching based on student performance"""

    if_struggling: Dict[str, str] = Field(
        ..., description="What to do if student is struggling"
    )
    if_mastering: Dict[str, str] = Field(
        ..., description="What to do if student is excelling"
    )


class SessionPlan(BaseModel):
    """A detailed session plan"""

    session_number: int = Field(..., description="Session number within unit")
    lesson_plan: Dict = Field(..., description="Detailed lesson plan")
    adaptive_branching: AdaptiveBranching


class UnitAssessment(BaseModel):
    """Assessment criteria for unit completion"""

    mastery_threshold: float = Field(..., ge=0, le=1, description="Mastery threshold (0-1)")
    min_sessions_required: int = Field(..., description="Minimum sessions required")
    exit_criteria: str = Field(..., description="Exit criteria description")


class UnitPrerequisite(BaseModel):
    """Prerequisites for a unit"""

    patterns: List[str] = Field(..., description="Patterns that should be mastered")
    mastery_required: float = Field(..., ge=0, le=1, description="Required mastery level (0-1)")


class Unit(BaseModel):
    """A unit in the curriculum"""

    unit_number: int = Field(..., description="Unit number in sequence")
    name: str = Field(..., description="Unit name/theme")
    duration: int = Field(..., description="Duration in sessions")
    prerequisite: UnitPrerequisite
    learning_goals: List[str] = Field(..., description="Learning goals")
    session_plans: List[SessionPlan] = Field(..., description="Session plans")
    assessment: UnitAssessment


class YearlyCurriculum(BaseModel):
    """A complete yearly curriculum"""

    grade: Literal[1, 2, 3, 4, 5] = Field(..., description="Grade level")
    objectives: List[str] = Field(..., description="Yearly learning objectives")
    units: List[Unit] = Field(..., description="All units for the year")
    prerequisites: Optional[List[str]] = None
    target_vocabulary_size: int = Field(..., description="Target vocabulary size by end of year")


class CurriculumProgress(BaseModel):
    """Student's progress through the curriculum"""

    student_id: str
    grade: int
    current_unit: int
    current_session: int
    total_sessions_completed: int
    pattern_mastery: Dict[str, float] = Field(default_factory=dict)  # pattern -> mastery (0-1)
    words_learned: List[str] = Field(default_factory=list)
    last_updated: str = Field(default_factory=lambda: datetime.now().isoformat())


class CurriculumRecommendation(BaseModel):
    """Recommendation for what student should do next"""

    next_focus: str
    recommended_session: SessionPlan
    reasoning: str
    estimated_sessions_remaining: int
