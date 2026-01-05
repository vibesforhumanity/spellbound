"""
Pattern Knowledge Database

Database of 70+ phonics patterns with sound variations, frequencies,
teaching sequences, and related patterns.
"""

from .types import PatternKnowledge, SoundVariation, RelatedPattern, TeachingStep

# Pattern database as a dictionary
PATTERN_DATABASE: dict[str, PatternKnowledge] = {}


def _register_pattern(pattern: PatternKnowledge) -> None:
    """Helper to register a pattern in the database"""
    PATTERN_DATABASE[pattern.pattern] = pattern


# ============================================================================
# VOWEL TEAMS
# ============================================================================

_register_pattern(
    PatternKnowledge(
        pattern="ea",
        type="vowel_team",
        display_name="Vowel Team 'ea'",
        sounds=[
            SoundVariation(
                pronunciation="long 'e' (ee)",
                frequency=70,
                examples=["beach", "teach", "dream", "team", "sea", "read", "each", "clean", "mean", "leaf"],
                teaching_note="Most common 'ea' sound - teach this first!",
                grade_level=(1, 2),
                difficulty=2,
            ),
            SoundVariation(
                pronunciation="short 'e' (eh)",
                frequency=25,
                examples=["bread", "head", "ready", "heavy", "weather", "instead", "spread", "thread"],
                teaching_note="Less common but important - 'ea' can also say 'eh' like in 'bed'",
                grade_level=(2, 3),
                difficulty=3,
            ),
            SoundVariation(
                pronunciation="long 'a' (ay)",
                frequency=5,
                examples=["break", "great", "steak"],
                teaching_note="Rare exception - only 3 common words! These are special.",
                grade_level=(3, 4),
                difficulty=4,
            ),
        ],
        related_patterns=[
            RelatedPattern(
                pattern="eau",
                relationship="french_origin",
                teaching_note="This is different from 'ea'! French loanwords where 'eau' says 'oh'",
                grade_level=(4, 5),
            ),
            RelatedPattern(
                pattern="ee",
                relationship="similar_sound",
                teaching_note="Both 'ea' and 'ee' can make the long 'e' sound - teach the difference!",
                grade_level=(1, 2),
            ),
        ],
        teaching_sequence=[
            TeachingStep(
                session=1,
                focus="Introduce 'ea' → 'ee' sound (most common)",
                words=["beach", "teach", "dream", "team", "sea"],
            ),
            TeachingStep(
                session=2,
                focus="Reinforce 'ea' → 'ee' with more words",
                words=["read", "each", "clean", "mean", "leaf"],
            ),
            TeachingStep(
                session=3,
                focus="Introduce 'ea' → 'eh' variation",
                words=["bread", "head", "ready", "heavy", "weather"],
            ),
            TeachingStep(
                session=4,
                focus="Contrast the two sounds: 'ee' vs 'eh'",
                words=["beach vs bread", "read vs ready", "team vs weather"],
                notes="Help students hear the difference and predict which sound",
            ),
            TeachingStep(
                session=5,
                focus="Mixed practice with both variations",
                words=["dream", "spread", "each", "instead", "clean"],
            ),
            TeachingStep(
                session=6,
                focus="Introduce rare exceptions ('ay' sound) and French 'eau'",
                words=["break", "great", "steak", "beautiful"],
                notes="Explain these are special - 'beautiful' has French 'eau' pattern",
            ),
        ],
        common_mistakes=["Confusing 'ea' with 'ee'", "Not knowing which sound 'ea' makes", "Spelling 'ea' as 'ee'"],
        mnemonics=["'Ea' for eating - most food words use 'ee' sound like 'peas' and 'meat'"],
    )
)

_register_pattern(
    PatternKnowledge(
        pattern="ee",
        type="vowel_team",
        display_name="Vowel Team 'ee'",
        sounds=[
            SoundVariation(
                pronunciation="long 'e' (ee)",
                frequency=99,
                examples=["tree", "see", "free", "green", "sleep", "feet", "meet", "week", "keep", "deep"],
                teaching_note="'ee' almost always says 'ee' - very consistent pattern!",
                grade_level=(1, 2),
                difficulty=1,
            ),
        ],
        related_patterns=[
            RelatedPattern(
                pattern="ea",
                relationship="similar_sound",
                teaching_note="Both can say 'ee', but 'ee' is more reliable",
                grade_level=(1, 2),
            ),
        ],
        teaching_sequence=[
            TeachingStep(
                session=1,
                focus="Introduce reliable 'ee' → 'ee' pattern",
                words=["tree", "see", "free", "green", "sleep"],
            ),
            TeachingStep(
                session=2,
                focus="Build confidence with more 'ee' words",
                words=["feet", "meet", "week", "keep", "deep"],
            ),
        ],
        common_mistakes=["Confusing with 'ea'"],
        mnemonics=["Double 'e' makes the 'e' say its name!"],
    )
)

_register_pattern(
    PatternKnowledge(
        pattern="sh",
        type="digraph",
        display_name="Digraph 'sh'",
        sounds=[
            SoundVariation(
                pronunciation="/sh/ (shh)",
                frequency=100,
                examples=["fish", "shop", "wish", "ship", "shell", "dish", "wash", "bush", "cash"],
                teaching_note="'sh' is very consistent - always makes 'shh' sound",
                grade_level=(1, 2),
                difficulty=1,
            ),
        ],
        teaching_sequence=[
            TeachingStep(
                session=1,
                focus="Introduce 'sh' sound at end of words",
                words=["fish", "wish", "dish", "wash", "cash"],
            ),
            TeachingStep(
                session=2,
                focus="'sh' at beginning of words",
                words=["shop", "ship", "shell", "bush"],
            ),
        ],
        common_mistakes=["Spelling as 's' alone"],
        mnemonics=["'Sh' is the quiet sound - 'shhhh'!"],
    )
)

_register_pattern(
    PatternKnowledge(
        pattern="ch",
        type="digraph",
        display_name="Digraph 'ch'",
        sounds=[
            SoundVariation(
                pronunciation="/ch/ (like church)",
                frequency=85,
                examples=["chair", "chip", "much", "each", "beach", "lunch", "bench", "catch"],
                teaching_note="Most common - the 'ch' sound like in 'chair'",
                grade_level=(1, 2),
                difficulty=2,
            ),
            SoundVariation(
                pronunciation="/k/ (like school)",
                frequency=10,
                examples=["school", "chemistry", "stomach", "anchor", "chorus"],
                teaching_note="Greek origin words - 'ch' says 'k'",
                grade_level=(3, 5),
                difficulty=4,
            ),
            SoundVariation(
                pronunciation="/sh/ (like chef)",
                frequency=5,
                examples=["chef", "machine", "chute", "chandelier"],
                teaching_note="French origin words - 'ch' says 'sh'",
                grade_level=(4, 5),
                difficulty=5,
            ),
        ],
        teaching_sequence=[
            TeachingStep(
                session=1,
                focus="Introduce common 'ch' → 'ch' sound",
                words=["chair", "chip", "much", "each", "beach"],
            ),
            TeachingStep(
                session=2,
                focus="Practice 'ch' in different positions",
                words=["lunch", "bench", "catch", "chicken", "cheese"],
            ),
            TeachingStep(
                session=3,
                focus="Introduce 'ch' → 'k' in Greek words",
                words=["school", "chemistry", "stomach"],
                notes="Explain these words come from Greek",
            ),
        ],
        common_mistakes=["Not knowing which sound to use"],
        mnemonics=["'Ch' is for 'chair' - that's the most common sound!"],
    )
)

_register_pattern(
    PatternKnowledge(
        pattern="-ing",
        type="suffix",
        display_name="Suffix '-ing'",
        sounds=[
            SoundVariation(
                pronunciation="/ing/",
                frequency=100,
                examples=["running", "jumping", "playing", "singing", "reading", "walking"],
                teaching_note="The '-ing' ending shows an action happening now",
                grade_level=(1, 2),
                difficulty=2,
            ),
        ],
        teaching_sequence=[
            TeachingStep(
                session=1,
                focus="Add '-ing' to simple verbs",
                words=["jump → jumping", "play → playing", "sing → singing"],
            ),
            TeachingStep(
                session=2,
                focus="Double consonant rule (run → running)",
                words=["run → running", "swim → swimming", "hop → hopping"],
                notes="Double the last letter for short vowel words!",
            ),
        ],
        common_mistakes=["Forgetting to double consonant", "Adding to non-verbs"],
        mnemonics=["'-ing' means it's happening right now!"],
    )
)

# Add more patterns as needed...
# TODO: Add remaining 65+ patterns (th, wh, oo, ow, ai, ay, oa, ar, er, ir, or, ur, -ed, -tion, etc.)
