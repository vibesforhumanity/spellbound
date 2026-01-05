"""
Curriculum System - Main Export

Exports all curriculum functionality.
"""

from .types import (
    YearlyCurriculum,
    Unit,
    SessionPlan,
    CurriculumProgress,
    CurriculumRecommendation,
    TargetPattern,
    Activity,
)
from .grade2 import GRADE_2_CURRICULUM
from .curriculum_engine import CurriculumEngine, curriculum_engine

__all__ = [
    "YearlyCurriculum",
    "Unit",
    "SessionPlan",
    "CurriculumProgress",
    "CurriculumRecommendation",
    "TargetPattern",
    "Activity",
    "GRADE_2_CURRICULUM",
    "CurriculumEngine",
    "curriculum_engine",
]
