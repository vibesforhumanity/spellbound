"""
Progress Storage

Manages student curriculum progress persistence.
"""

import json
import os
from pathlib import Path
from typing import Optional
from .curriculum import CurriculumProgress, curriculum_engine

PROGRESS_DIR = Path(".progress")


def ensure_progress_dir():
    """Ensure progress directory exists"""
    PROGRESS_DIR.mkdir(exist_ok=True)


def get_progress_file_path(student_id: str) -> Path:
    """Get file path for a student's progress"""
    return PROGRESS_DIR / f"{student_id}.json"


def load_progress(student_id: str) -> Optional[CurriculumProgress]:
    """Load student's curriculum progress from disk"""
    try:
        file_path = get_progress_file_path(student_id)
        with open(file_path, "r") as f:
            data = json.load(f)
            return CurriculumProgress(**data)
    except FileNotFoundError:
        return None


def save_progress(progress: CurriculumProgress):
    """Save student's curriculum progress to disk"""
    ensure_progress_dir()
    file_path = get_progress_file_path(progress.student_id)
    with open(file_path, "w") as f:
        json.dump(progress.model_dump(), f, indent=2)


def get_or_create_progress(student_id: str, grade: int) -> CurriculumProgress:
    """Get existing progress or create new one"""
    progress = load_progress(student_id)
    if progress:
        return progress

    # Create new progress
    progress = curriculum_engine.create_new_progress(student_id, grade)
    save_progress(progress)
    return progress
