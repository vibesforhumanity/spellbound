"""
Curriculum Engine

Manages student progress through the curriculum, makes adaptive
recommendations, and tracks mastery levels.
"""

from typing import Optional, Dict, List
from datetime import datetime
from .grade2 import GRADE_2_CURRICULUM
from .types import (
    YearlyCurriculum,
    Unit,
    SessionPlan,
    CurriculumProgress,
    CurriculumRecommendation,
)


class CurriculumEngine:
    """Engine for managing curriculum progression"""

    def __init__(self):
        self.curricula: Dict[int, YearlyCurriculum] = {
            2: GRADE_2_CURRICULUM,
            # TODO: Add grades 1, 3, 4, 5
        }

    def get_curriculum(self, grade: int) -> Optional[YearlyCurriculum]:
        """Get curriculum for a specific grade"""
        return self.curricula.get(grade)

    def get_unit(self, grade: int, unit_number: int) -> Optional[Unit]:
        """Get a specific unit from a curriculum"""
        curriculum = self.get_curriculum(grade)
        if not curriculum:
            return None

        return next((u for u in curriculum.units if u.unit_number == unit_number), None)

    def get_session_plan(
        self, grade: int, unit_number: int, session_number: int
    ) -> Optional[SessionPlan]:
        """Get a specific session plan"""
        unit = self.get_unit(grade, unit_number)
        if not unit:
            return None

        return next(
            (s for s in unit.session_plans if s.session_number == session_number),
            None,
        )

    def meets_prerequisites(
        self, unit: Unit, pattern_mastery: Dict[str, float]
    ) -> tuple[bool, List[str]]:
        """Determine if student meets prerequisites for a unit"""
        missing = []

        for prereq_pattern in unit.prerequisite.patterns:
            mastery = pattern_mastery.get(prereq_pattern, 0)
            if mastery < unit.prerequisite.mastery_required:
                missing.append(prereq_pattern)

        return (len(missing) == 0, missing)

    def has_completed_unit(
        self, unit: Unit, sessions_completed: int, pattern_mastery: Dict[str, float]
    ) -> bool:
        """Determine if student has completed a unit"""
        # Check minimum sessions requirement
        if sessions_completed < unit.assessment.min_sessions_required:
            return False

        # Extract all patterns taught in this unit
        unit_patterns = set()
        for session in unit.session_plans:
            for tp in session.lesson_plan.get("target_patterns", []):
                if isinstance(tp, dict):
                    unit_patterns.add(tp["pattern"])

        if not unit_patterns:
            return False

        # Calculate average mastery for unit patterns
        total_mastery = sum(pattern_mastery.get(p, 0) for p in unit_patterns)
        average_mastery = total_mastery / len(unit_patterns)

        return average_mastery >= unit.assessment.mastery_threshold

    def get_recommendation(
        self,
        progress: CurriculumProgress,
        recent_accuracy: float,
        last_session_patterns: List[str],
    ) -> CurriculumRecommendation:
        """Get recommendation for what student should do next"""
        curriculum = self.get_curriculum(progress.grade)
        if not curriculum:
            raise ValueError(f"No curriculum found for grade {progress.grade}")

        current_unit = self.get_unit(progress.grade, progress.current_unit)
        if not current_unit:
            raise ValueError(f"Unit {progress.current_unit} not found")

        # Check if struggling (accuracy < 60%)
        if recent_accuracy < 0.6:
            return self._handle_struggling(progress, current_unit, last_session_patterns)

        # Check if mastering (accuracy > 90%)
        if recent_accuracy > 0.9:
            return self._handle_mastering(progress, current_unit, curriculum)

        # Normal progress - continue with next session
        return self._handle_normal_progress(progress, current_unit, curriculum)

    def _handle_struggling(
        self, progress: CurriculumProgress, unit: Unit, last_session_patterns: List[str]
    ) -> CurriculumRecommendation:
        """Handle case where student is struggling"""
        # Find weakest pattern
        weakest_pattern = ""
        lowest_mastery = 1.0

        for pattern in last_session_patterns:
            mastery = progress.pattern_mastery.get(pattern, 0)
            if mastery < lowest_mastery:
                lowest_mastery = mastery
                weakest_pattern = pattern

        # Recommend reviewing current session
        current_session = self.get_session_plan(
            progress.grade, progress.current_unit, progress.current_session
        )

        if current_session:
            return CurriculumRecommendation(
                next_focus=f"Review {weakest_pattern} pattern - student needs more practice",
                recommended_session=current_session,
                reasoning=f"Student is struggling (accuracy < 60%). Focusing on {weakest_pattern} pattern which has {int(lowest_mastery * 100)}% mastery.",
                estimated_sessions_remaining=unit.duration - progress.current_session + 2,
            )

        # Fallback
        return self._handle_normal_progress(progress, unit, self.get_curriculum(progress.grade))

    def _handle_mastering(
        self, progress: CurriculumProgress, unit: Unit, curriculum: YearlyCurriculum
    ) -> CurriculumRecommendation:
        """Handle case where student is mastering content"""
        # Check if unit is complete
        unit_complete = self.has_completed_unit(
            unit, progress.current_session, progress.pattern_mastery
        )

        if unit_complete:
            # Move to next unit
            next_unit = self.get_unit(progress.grade, progress.current_unit + 1)

            if next_unit:
                first_session = next_unit.session_plans[0]
                return CurriculumRecommendation(
                    next_focus=f"Begin {next_unit.name}",
                    recommended_session=first_session,
                    reasoning=f"Student has mastered Unit {unit.unit_number}! Moving to next unit.",
                    estimated_sessions_remaining=next_unit.duration,
                )
            else:
                # Completed all units!
                return CurriculumRecommendation(
                    next_focus="Congratulations! Curriculum complete!",
                    recommended_session=unit.session_plans[-1],
                    reasoning=f"Student has completed all {len(curriculum.units)} units for Grade {progress.grade}!",
                    estimated_sessions_remaining=0,
                )

        # Not complete yet, but doing well - skip ahead
        next_session_number = min(
            progress.current_session + 2, len(unit.session_plans)
        )
        next_session = self.get_session_plan(
            progress.grade, progress.current_unit, next_session_number
        )

        if next_session:
            return CurriculumRecommendation(
                next_focus=f"Advance to {next_session.lesson_plan['focus']}",
                recommended_session=next_session,
                reasoning="Student is excelling (accuracy > 90%). Accelerating progress by skipping ahead.",
                estimated_sessions_remaining=max(unit.duration - next_session_number, 1),
            )

        return self._handle_normal_progress(progress, unit, curriculum)

    def _handle_normal_progress(
        self, progress: CurriculumProgress, unit: Unit, curriculum: YearlyCurriculum
    ) -> CurriculumRecommendation:
        """Handle normal progress (60-90% accuracy)"""
        # Move to next session in sequence
        next_session_number = progress.current_session + 1
        next_session = self.get_session_plan(
            progress.grade, progress.current_unit, next_session_number
        )

        if next_session:
            return CurriculumRecommendation(
                next_focus=next_session.lesson_plan["focus"],
                recommended_session=next_session,
                reasoning="Student is making good progress. Continuing with planned curriculum.",
                estimated_sessions_remaining=unit.duration - next_session_number + 1,
            )

        # End of unit - check if ready for next
        unit_complete = self.has_completed_unit(
            unit, progress.current_session, progress.pattern_mastery
        )

        if unit_complete:
            next_unit = self.get_unit(progress.grade, progress.current_unit + 1)
            if next_unit:
                first_session = next_unit.session_plans[0]
                return CurriculumRecommendation(
                    next_focus=f"Begin {next_unit.name}",
                    recommended_session=first_session,
                    reasoning=f"Unit {unit.unit_number} complete. Starting next unit.",
                    estimated_sessions_remaining=next_unit.duration,
                )

        # Need more practice in current unit
        last_session = unit.session_plans[-1]
        return CurriculumRecommendation(
            next_focus=f"Additional practice for {unit.name}",
            recommended_session=last_session,
            reasoning=f"Student needs more practice to meet unit mastery threshold ({int(unit.assessment.mastery_threshold * 100)}%).",
            estimated_sessions_remaining=2,
        )

    def create_new_progress(self, student_id: str, grade: int) -> CurriculumProgress:
        """Initialize progress for a new student"""
        return CurriculumProgress(
            student_id=student_id,
            grade=grade,
            current_unit=1,
            current_session=1,
            total_sessions_completed=0,
            pattern_mastery={},
            words_learned=[],
            last_updated=datetime.now().isoformat(),
        )

    def update_progress(
        self,
        progress: CurriculumProgress,
        session_results: Dict,
    ) -> CurriculumProgress:
        """Update progress after a session"""
        # Update words learned
        for word in session_results["correct_words"]:
            if word not in progress.words_learned:
                progress.words_learned.append(word)

        # Update pattern mastery (exponential moving average)
        alpha = 0.3  # Weight for new data
        for pattern, accuracy in session_results["pattern_accuracy"].items():
            current_mastery = progress.pattern_mastery.get(pattern, 0)
            progress.pattern_mastery[pattern] = current_mastery * (1 - alpha) + accuracy * alpha

        # Increment session counter
        progress.total_sessions_completed += 1
        progress.last_updated = datetime.now().isoformat()

        return progress

    def advance_to_next_session(
        self, progress: CurriculumProgress, recommendation: CurriculumRecommendation
    ) -> CurriculumProgress:
        """Advance to next session based on recommendation"""
        # Find which unit contains the recommended session
        curriculum = self.get_curriculum(progress.grade)
        if curriculum:
            for unit in curriculum.units:
                if recommendation.recommended_session in unit.session_plans:
                    progress.current_unit = unit.unit_number
                    progress.current_session = recommendation.recommended_session.session_number
                    break

        progress.last_updated = datetime.now().isoformat()
        return progress


# Export singleton instance
curriculum_engine = CurriculumEngine()
