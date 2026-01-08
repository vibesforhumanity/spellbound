"""
Coach Spark API

FastAPI server for the spelling coach agent.
"""

import os
import json
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

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


class TextToSpeechRequest(BaseModel):
    text: str
    voice: str = "nova"  # Options: alloy, echo, fable, onyx, nova, shimmer


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
        # Load or create progress
        progress = load_progress(request.student_id)
        if not progress:
            print(f"⚠️  No progress found for {request.student_id}, creating default student (grade 3)")
            progress = get_or_create_progress(request.student_id, grade=3)

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
        # Load or create progress
        progress = load_progress(request.student_id)
        if not progress:
            print(f"⚠️  No progress found for {request.student_id}, creating default student (grade 3)")
            progress = get_or_create_progress(request.student_id, grade=3)

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
        # Load or create progress
        progress = load_progress(request.student_id)
        if not progress:
            print(f"⚠️  No progress found for {request.student_id}, creating default student (grade 3)")
            progress = get_or_create_progress(request.student_id, grade=3)

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
        # Create a detailed prompt for context-aware question generation
        prompt = f"""Generate a multiple choice question to help a student master the '{request.pattern}' pattern.

**What just happened:**
The student tried to spell "{request.incorrect_word}" but wrote "{request.user_attempt}".

**Error analysis:**
- Correct pattern: {request.pattern} in "{request.incorrect_word}"
- Student's error: They used "{request.user_attempt}" instead
- This shows confusion about: {request.pattern}

**This is attempt {request.previous_attempts + 1} of 3.**

**Your task:**
Create a question that DIRECTLY addresses their specific confusion. The question should:

1. **Focus on their exact error** - If they wrote "nune" instead of "noon", test their understanding of "-une" vs "-oon"
2. **Include options that mirror their mistake** - Create wrong answers that use the student's error pattern
3. **Build on the word they missed** - Use similar words or the same pattern
4. **Be appropriate for elementary students** (ages 6-11)
5. **Have exactly ONE correct answer** among 4 options

**Example format:**
If student wrote "nune" → "noon", your options might include:
- Words with correct "-oon" pattern (moon, spoon, soon)
- Words with the wrong "-une" pattern they used (tune, dune, june)
- Make one of the "-une" words the INCORRECT answer to test if they now understand

Return ONLY a JSON object:
{{
    "question": "Which word is spelled INCORRECTLY?",
    "options": ["a) word1", "b) word2", "c) word3", "d) word4"],
    "correct_answer": "letter) wrong_word",
    "explanation": "Great work! [Explain why the wrong one is wrong and reinforce the {request.pattern} pattern]"
}}"""

        # Use a simple OpenAI call for question generation
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
        print(f"\n🎓 GET FEEDBACK REQUEST")
        print(f"   Word: {request.incorrect_word}")
        print(f"   Attempt: {request.user_attempt}")
        print(f"   Patterns: {request.incorrect_patterns}")

        # Load or create progress
        progress = load_progress(request.student_id)
        if not progress:
            print(f"⚠️  No progress found for {request.student_id}, creating default student (grade 3)")
            progress = get_or_create_progress(request.student_id, grade=3)

        history = conversations.get(request.session_id, [])

        # Create detailed coaching prompt
        patterns_str = ", ".join(request.incorrect_patterns)

        # Analyze the specific error
        error_analysis = f"I spelled '{request.user_attempt}' instead of '{request.incorrect_word}'"

        print(f"🤖 Calling Coach Spark agent for personalized feedback...")

        coaching_prompt = f"""A student just made a spelling mistake and needs your supportive coaching!

**What happened:**
- Target word: "{request.incorrect_word}"
- Student wrote: "{request.user_attempt}"
- Patterns they struggled with: {patterns_str}

**Your task:**
1. Acknowledge their effort warmly and personally
2. Explain EXACTLY what they got wrong (compare their spelling to the correct one)
3. Teach them about the {request.incorrect_patterns[0] if request.incorrect_patterns else 'pattern'} in an encouraging way
4. Give them a memorable tip, mnemonic, or fun fact to remember this pattern
5. Connect it to other words they might know

Be warm, encouraging, and make them feel excited to learn! Use their actual attempt ('{request.user_attempt}') in your explanation."""

        # Run agent to get feedback
        message, updated_history, updated_progress = run_coach_spark(
            coaching_prompt, history, progress
        )

        print(f"✅ Coach Spark response received:")
        print(f"   Length: {len(message)} characters")
        print(f"   Preview: {message[:100]}...")

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


@app.post("/api/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Convert text to speech using OpenAI's natural voices"""
    try:
        from fastapi.responses import StreamingResponse
        import io

        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Generate speech using OpenAI TTS
        response = client.audio.speech.create(
            model="tts-1",  # or "tts-1-hd" for higher quality
            voice=request.voice,
            input=request.text
        )

        # Stream the audio back
        audio_stream = io.BytesIO(response.content)

        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
