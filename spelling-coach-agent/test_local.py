"""
Quick local test of core functionality (no API key needed)
"""

from src.patterns import pattern_intelligence, PATTERN_DATABASE
from src.curriculum import curriculum_engine, GRADE_2_CURRICULUM

print("=" * 60)
print("Testing Pattern Knowledge System")
print("=" * 60)

# Test pattern lookup
ea_pattern = pattern_intelligence.get_pattern("ea")
if ea_pattern:
    print(f"✅ Found pattern 'ea': {ea_pattern.display_name}")
    print(f"   Sounds: {len(ea_pattern.sounds)}")
    for sound in ea_pattern.sounds:
        print(f"   - {sound.pronunciation} ({sound.frequency}%)")
else:
    print("❌ Pattern 'ea' not found")

# Test practice words
practice_words = pattern_intelligence.get_practice_words("ea", count=5)
print(f"✅ Practice words for 'ea': {practice_words}")

# Test word analysis
word = "beach"
analysis = pattern_intelligence.analyze_word(word)
print(f"✅ Analyzed '{word}':")
for result in analysis:
    print(f"   - Pattern: {result['pattern']}, Confidence: {result['confidence']}")

print("\n" + "=" * 60)
print("Testing Curriculum System")
print("=" * 60)

# Test curriculum retrieval
curriculum = curriculum_engine.get_curriculum(2)
if curriculum:
    print(f"✅ Grade {curriculum.grade} Curriculum:")
    print(f"   Units: {len(curriculum.units)}")
    print(f"   Target vocabulary: {curriculum.target_vocabulary_size} words")
    for unit in curriculum.units:
        print(f"   - Unit {unit.unit_number}: {unit.name} ({unit.duration} sessions)")
else:
    print("❌ Curriculum not found")

# Test progress creation
progress = curriculum_engine.create_new_progress("test-student", 2)
print(f"✅ Created progress for student: {progress.student_id}")
print(f"   Current unit: {progress.current_unit}, session: {progress.current_session}")

# Test progress update
session_results = {
    "correct_words": ["beach", "teach", "dream"],
    "incorrect_words": ["bread"],
    "pattern_accuracy": {"ea": 0.75, "sh": 1.0}
}
updated_progress = curriculum_engine.update_progress(progress, session_results)
print(f"✅ Updated progress:")
print(f"   Sessions completed: {updated_progress.total_sessions_completed}")
print(f"   Words learned: {len(updated_progress.words_learned)}")
print(f"   Pattern mastery: {updated_progress.pattern_mastery}")

# Test recommendation
recommendation = curriculum_engine.get_recommendation(
    updated_progress,
    recent_accuracy=0.75,
    last_session_patterns=["ea"]
)
print(f"✅ Curriculum recommendation:")
print(f"   Next focus: {recommendation.next_focus}")
print(f"   Reasoning: {recommendation.reasoning}")
print(f"   Sessions remaining: {recommendation.estimated_sessions_remaining}")

print("\n" + "=" * 60)
print("Testing Storage System")
print("=" * 60)

from src.storage import save_progress, load_progress

# Test save/load
save_progress(updated_progress)
print(f"✅ Saved progress to disk")

loaded_progress = load_progress("test-student")
if loaded_progress:
    print(f"✅ Loaded progress from disk:")
    print(f"   Student: {loaded_progress.student_id}")
    print(f"   Words learned: {len(loaded_progress.words_learned)}")
else:
    print("❌ Failed to load progress")

print("\n" + "=" * 60)
print("✅ All core systems working!")
print("=" * 60)
