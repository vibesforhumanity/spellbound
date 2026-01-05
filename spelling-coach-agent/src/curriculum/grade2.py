"""
Grade 2 Curriculum

Complete spelling curriculum for 2nd grade with units, session plans,
and adaptive branching logic.
"""

from .types import (
    YearlyCurriculum,
    Unit,
    SessionPlan,
    TargetPattern,
    Activity,
    AdaptiveBranching,
    UnitPrerequisite,
    UnitAssessment,
)

GRADE_2_CURRICULUM = YearlyCurriculum(
    grade=2,
    objectives=[
        "Master consonant digraphs (sh, ch, th, wh)",
        "Learn vowel teams (ea, ee, oa, ow, ai, ay)",
        "Understand magic e pattern",
        "Practice r-controlled vowels (ar, er, ir, or, ur)",
        "Master common suffixes (-ing, -ed, -er, -est)",
        "Build 500-word spelling vocabulary",
    ],
    prerequisites=["Basic letter-sound correspondence", "CVC (consonant-vowel-consonant) words"],
    target_vocabulary_size=500,
    units=[
        # Unit 1: Consonant Digraphs
        Unit(
            unit_number=1,
            name="Consonant Digraphs: sh, ch, th",
            duration=6,
            prerequisite=UnitPrerequisite(
                patterns=["Short vowels"],
                mastery_required=0.7,
            ),
            learning_goals=[
                "Recognize that two letters can make one sound",
                "Master 'sh', 'ch', and 'th' sounds",
                "Spell 30+ words with digraphs",
            ],
            session_plans=[
                SessionPlan(
                    session_number=1,
                    lesson_plan={
                        "focus": "Introduce 'sh' digraph",
                        "target_patterns": [
                            TargetPattern(
                                pattern="sh",
                                sound="/sh/",
                                examples=["fish", "wish", "dish", "shop", "shell"],
                            ).dict()
                        ],
                        "vocabulary_goals": [
                            "fish",
                            "wish",
                            "dish",
                            "shop",
                            "shell",
                            "wash",
                            "cash",
                            "bash",
                            "bush",
                            "rush",
                        ],
                        "activities": [
                            Activity(template="listenAndSpell", count=10, difficulty="easy").dict(),
                            Activity(template="multipleChoice", count=3).dict(),
                        ],
                        "exit_criteria": {"minimum_correct": 8, "pattern_mastery": 0.7},
                    },
                    adaptive_branching=AdaptiveBranching(
                        if_struggling={
                            "action": "More 'sh' practice with easier words",
                            "next_session": "Repeat Session 1 with new words",
                        },
                        if_mastering={
                            "action": "Introduce 'ch' digraph",
                            "next_session": "Session 2",
                        },
                    ),
                ),
                SessionPlan(
                    session_number=2,
                    lesson_plan={
                        "focus": "Introduce 'ch' digraph",
                        "target_patterns": [
                            TargetPattern(
                                pattern="ch",
                                sound="/ch/",
                                examples=["chip", "much", "chair", "beach", "lunch"],
                            ).dict()
                        ],
                        "vocabulary_goals": [
                            "chip",
                            "much",
                            "chair",
                            "beach",
                            "lunch",
                            "bench",
                            "catch",
                            "each",
                            "rich",
                            "such",
                        ],
                        "activities": [
                            Activity(template="listenAndSpell", count=10, difficulty="easy").dict(),
                            Activity(template="multipleChoice", count=3).dict(),
                        ],
                        "exit_criteria": {"minimum_correct": 8, "pattern_mastery": 0.7},
                    },
                    adaptive_branching=AdaptiveBranching(
                        if_struggling={
                            "action": "Review 'sh' and 'ch' together",
                            "next_session": "Repeat Session 2",
                        },
                        if_mastering={
                            "action": "Introduce 'th' digraph",
                            "next_session": "Session 3",
                        },
                    ),
                ),
                # Add more sessions for 'th' and mixed practice...
            ],
            assessment=UnitAssessment(
                mastery_threshold=0.75,
                min_sessions_required=4,
                exit_criteria="Student can spell 25+ digraph words with 75% accuracy",
            ),
        ),
        # Unit 2: Vowel Teams 'ea' and 'ee'
        Unit(
            unit_number=2,
            name="Vowel Teams: ea and ee",
            duration=6,
            prerequisite=UnitPrerequisite(
                patterns=["Short vowels", "Digraphs"],
                mastery_required=0.7,
            ),
            learning_goals=[
                "Understand that two vowels can work together",
                "Master 'ee' pattern (always says 'ee')",
                "Learn 'ea' pattern (usually says 'ee', sometimes 'eh')",
                "Spell 40+ vowel team words",
            ],
            session_plans=[
                SessionPlan(
                    session_number=1,
                    lesson_plan={
                        "focus": "Introduce 'ee' (consistent pattern)",
                        "target_patterns": [
                            TargetPattern(
                                pattern="ee",
                                sound="long 'e' (ee)",
                                examples=["tree", "see", "free", "green", "sleep"],
                            ).dict()
                        ],
                        "vocabulary_goals": [
                            "tree",
                            "see",
                            "free",
                            "green",
                            "sleep",
                            "feet",
                            "meet",
                            "week",
                            "keep",
                            "deep",
                        ],
                        "activities": [
                            Activity(template="listenAndSpell", count=10, difficulty="easy").dict(),
                            Activity(template="multipleChoice", count=3).dict(),
                        ],
                        "exit_criteria": {"minimum_correct": 8, "pattern_mastery": 0.7},
                    },
                    adaptive_branching=AdaptiveBranching(
                        if_struggling={
                            "action": "More 'ee' practice",
                            "next_session": "Repeat with new words",
                        },
                        if_mastering={
                            "action": "Introduce 'ea' pattern",
                            "next_session": "Session 2",
                        },
                    ),
                ),
                SessionPlan(
                    session_number=2,
                    lesson_plan={
                        "focus": "Introduce 'ea' → long 'e' sound",
                        "target_patterns": [
                            TargetPattern(
                                pattern="ea",
                                sound="long 'e' (ee)",
                                examples=["beach", "teach", "dream", "team", "sea"],
                            ).dict()
                        ],
                        "vocabulary_goals": [
                            "beach",
                            "teach",
                            "dream",
                            "team",
                            "sea",
                            "read",
                            "each",
                            "clean",
                            "mean",
                            "leaf",
                        ],
                        "activities": [
                            Activity(template="listenAndSpell", count=10, difficulty="medium").dict(),
                            Activity(template="patternDetective", count=3, challenge="Think of 'ea' words!").dict(),
                        ],
                        "exit_criteria": {"minimum_correct": 8, "pattern_mastery": 0.7},
                    },
                    adaptive_branching=AdaptiveBranching(
                        if_struggling={
                            "action": "Practice distinguishing 'ea' vs 'ee'",
                            "next_session": "Repeat Session 2",
                        },
                        if_mastering={
                            "action": "Introduce 'ea' → short 'e' variation",
                            "next_session": "Session 3",
                        },
                    ),
                ),
                # Add more sessions for 'ea' → 'eh' and mixed practice...
            ],
            assessment=UnitAssessment(
                mastery_threshold=0.75,
                min_sessions_required=4,
                exit_criteria="Student can spell 30+ vowel team words with 75% accuracy",
            ),
        ),
        # TODO: Add Unit 3 (Magic E), Unit 4 (R-controlled vowels), etc.
    ],
)
