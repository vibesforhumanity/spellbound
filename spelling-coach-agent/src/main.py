"""
Coach Spark API

FastAPI server for the spelling coach agent.
"""

import os
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .agent import run_coach_spark
from .storage import get_or_create_progress, save_progress, load_progress
from .curriculum import curriculum_engine

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Coach Spark API",
    description="Intelligent spelling coach with curriculum and pattern knowledge",
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory conversation storage (in production, use Redis or database)
conversations: Dict[str, List[Dict]] = {}


# ============================================================================
# Request/Response Models
# ============================================================================


class StartSessionRequest(BaseModel):
    student_id: str
    grade: int
    initial_message: Optional[str] = None


class StartSessionResponse(BaseModel):
    session_id: str
    message: str
    progress: Dict


class SubmitAnswerRequest(BaseModel):
    session_id: str
    student_id: str
    answer: str


class SubmitAnswerResponse(BaseModel):
    message: str
    progress: Dict


class AskQuestionRequest(BaseModel):
    session_id: str
    student_id: str
    question: str


class AskQuestionResponse(BaseModel):
    message: str
    progress: Dict


class EndSessionRequest(BaseModel):
    session_id: str
    student_id: str
    session_results: Dict


class EndSessionResponse(BaseModel):
    message: str
    progress: Dict
    next_recommendation: Optional[Dict] = None


class GenerateQuestionRequest(BaseModel):
    session_id: str
    incorrect_word: str
    user_attempt: str
    pattern: str
    previous_attempts: int = 0


class MultipleChoiceQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str


class GenerateQuestionResponse(BaseModel):
    success: bool
    question: Optional[MultipleChoiceQuestion] = None
    error: Optional[str] = None


class GetFeedbackRequest(BaseModel):
    session_id: str
    student_id: str
    incorrect_word: str
    user_attempt: str
    incorrect_patterns: List[str]


class GetFeedbackResponse(BaseModel):
    feedback: str
    pattern_tips: List[str]


# ============================================================================
# Endpoints
# ============================================================================


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    has_api_key = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "ok",
        "service": "coach-spark-api",
        "provider": "openai",
        "api_key_configured": has_api_key,
    }


@app.post("/api/start-session", response_model=StartSessionResponse)
async def start_session(request: StartSessionRequest):
    """Start a new coaching session"""
    try:
        # Get or create progress
        progress = get_or_create_progress(request.student_id, request.grade)

        # Initialize conversation history
        session_id = f"{request.student_id}-{progress.total_sessions_completed + 1}"
        conversations[session_id] = []

        # Default initial message
        initial_message = (
            request.initial_message
            or "Hi Coach Spark! I'm ready to practice my spelling. What should we work on today?"
        )

        # Run agent
        message, history, updated_progress = run_coach_spark(
            initial_message, conversations[session_id], progress
        )

        # Update conversation history
        conversations[session_id] = history

        # Save progress
        save_progress(updated_progress)

        return StartSessionResponse(
            session_id=session_id,
            message=message,
            progress=updated_progress.model_dump(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/submit-answer", response_model=SubmitAnswerResponse)
async def submit_answer(request: SubmitAnswerRequest):
    """Submit a spelling answer"""
    try:
        # Load progress and conversation
        progress = load_progress(request.student_id)
        if not progress:
            raise HTTPException(status_code=404, detail="Student not found")

        history = conversations.get(request.session_id, [])

        # Run agent with answer
        message, updated_history, updated_progress = run_coach_spark(
            request.answer, history, progress
        )

        # Update storage
        conversations[request.session_id] = updated_history
        save_progress(updated_progress)

        return SubmitAnswerResponse(
            message=message,
            progress=updated_progress.model_dump(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ask-question", response_model=AskQuestionResponse)
async def ask_question(request: AskQuestionRequest):
    """Ask Coach Spark a question"""
    try:
        # Load progress and conversation
        progress = load_progress(request.student_id)
        if not progress:
            raise HTTPException(status_code=404, detail="Student not found")

        history = conversations.get(request.session_id, [])

        # Run agent with question
        message, updated_history, updated_progress = run_coach_spark(
            request.question, history, progress
        )

        # Update storage
        conversations[request.session_id] = updated_history
        save_progress(updated_progress)

        return AskQuestionResponse(
            message=message,
            progress=updated_progress.model_dump(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/end-session", response_model=EndSessionResponse)
async def end_session(request: EndSessionRequest):
    """End a coaching session and get next recommendation"""
    try:
        # Load progress and conversation
        progress = load_progress(request.student_id)
        if not progress:
            raise HTTPException(status_code=404, detail="Student not found")

        history = conversations.get(request.session_id, [])

        # Calculate session summary
        results = request.session_results
        total_words = len(results.get("correct_words", [])) + len(
            results.get("incorrect_words", [])
        )
        accuracy = (
            len(results.get("correct_words", [])) / total_words if total_words > 0 else 0
        )

        # Tell agent session is ending
        message, updated_history, updated_progress = run_coach_spark(
            f"I'm done with my practice! I got {len(results.get('correct_words', []))} out of {total_words} words correct.",
            history,
            progress,
        )

        # Get next recommendation
        last_patterns = list(results.get("pattern_accuracy", {}).keys())
        recommendation = curriculum_engine.get_recommendation(
            updated_progress, accuracy, last_patterns
        )

        # Update storage
        conversations[request.session_id] = updated_history
        save_progress(updated_progress)

        # Clean up conversation from memory
        if request.session_id in conversations:
            del conversations[request.session_id]

        return EndSessionResponse(
            message=message,
            progress=updated_progress.model_dump(),
            next_recommendation={
                "next_focus": recommendation.next_focus,
                "reasoning": recommendation.reasoning,
                "estimated_sessions_remaining": recommendation.estimated_sessions_remaining,
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/progress/{student_id}")
async def get_progress(student_id: str):
    """Get student's curriculum progress"""
    progress = load_progress(student_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Student not found")

    return {"progress": progress.model_dump()}


@app.post("/api/generate-question", response_model=GenerateQuestionResponse)
async def generate_question(request: GenerateQuestionRequest):
    """Generate a multiple choice question based on student's misspelling"""
    try:
        # Create a prompt for the agent to generate a question
        prompt = f"""Generate a multiple choice question to help the student learn the '{request.pattern}' pattern.

The student misspelled '{request.incorrect_word}' as '{request.user_attempt}'.

This is attempt {request.previous_attempts + 1} of 3.

Create a question that:
1. Tests understanding of the '{request.pattern}' pattern
2. Incorporates the student's specific misspelling pattern (what they wrote vs. what was correct)
3. Uses grade-appropriate vocabulary
4. Has 4 options (a, b, c, d) with exactly one correct answer
5. Includes an encouraging explanation

Return ONLY a JSON object with this exact structure:
{{
    "question": "Which word is spelled INCORRECTLY?",
    "options": ["a) word1", "b) word2", "c) word3", "d) word4"],
    "correct_answer": "c) word3",
    "explanation": "Brief encouraging explanation of the pattern"
}}"""

        # Use a simple OpenAI call for question generation
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are Coach Spark, an encouraging spelling coach. Generate educational multiple choice questions as JSON."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )

        import json
        question_data = json.loads(response.choices[0].message.content)

        question = MultipleChoiceQuestion(**question_data)

        return GenerateQuestionResponse(
            success=True,
            question=question,
            error=None
        )

    except Exception as e:
        print(f"❌ Error generating question: {str(e)}")
        return GenerateQuestionResponse(
            success=False,
            question=None,
            error=str(e)
        )


@app.post("/api/get-feedback", response_model=GetFeedbackResponse)
async def get_feedback(request: GetFeedbackRequest):
    """Get immediate coaching feedback for an incorrect answer"""
    try:
        # Load progress and conversation
        progress = load_progress(request.student_id)
        if not progress:
            raise HTTPException(status_code=404, detail="Student not found")

        history = conversations.get(request.session_id, [])

        # Create coaching prompt
        patterns_str = ", ".join(request.incorrect_patterns)
        coaching_prompt = f"""I just spelled '{request.incorrect_word}' as '{request.user_attempt}' and got it wrong.
The patterns I struggled with were: {patterns_str}

Can you help me understand what I got wrong and give me a tip to remember it?"""

        # Run agent to get feedback
        message, updated_history, updated_progress = run_coach_spark(
            coaching_prompt, history, progress
        )

        # Update storage
        conversations[request.session_id] = updated_history
        save_progress(updated_progress)

        # Extract pattern tips from the response
        pattern_tips = []
        for pattern in request.incorrect_patterns[:2]:  # Max 2 tips
            pattern_tips.append(f"Remember: {pattern}")

        return GetFeedbackResponse(
            feedback=message,
            pattern_tips=pattern_tips
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
