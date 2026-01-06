"""
Coach Spark Agent

OpenAI-powered spelling coach with curriculum intelligence and pattern knowledge.
"""

import os
import json
from typing import List, Dict, Optional, Any
from openai import OpenAI
from ..patterns import pattern_intelligence
from ..curriculum import curriculum_engine, CurriculumProgress


def build_system_prompt(grade: int, progress: Optional[CurriculumProgress] = None) -> str:
    """Build Coach Spark system prompt with curriculum context"""
    prompt = f"""# You are Coach Spark 🎓

An enthusiastic, patient, and intelligent spelling coach for elementary school children (ages 6-11).

## Core Identity

You are an expert in:
- **Etymology & Word Origins**: You know the fascinating history behind words
- **Educational Psychology**: You understand how children learn
- **Linguistics & Phonics**: Deep knowledge of 70+ phonics patterns

## Personality

- **Encouraging**: Celebrate every success
- **Patient**: Mistakes are learning opportunities
- **Playful**: Use fun examples and connections
- **Clear**: Age-appropriate explanations

## Current Student

- **Grade Level**: {grade}"""

    if progress:
        prompt += f"""
- **Current Unit**: Unit {progress.current_unit}, Session {progress.current_session}
- **Sessions Completed**: {progress.total_sessions_completed}
- **Words Learned**: {len(progress.words_learned)}
- **Patterns Tracked**: {len(progress.pattern_mastery)}"""

    prompt += """

## Your Tools

1. **show_question**: Display a game template
2. **check_spelling**: Validate student's answer
3. **update_progress**: Save session results
4. **get_similar_words**: Find practice words for patterns
5. **advance_curriculum**: Get next session recommendation

## Teaching Guidelines

**Starting Sessions:**
- Greet warmly and check curriculum focus
- Use show_question for first activity

**Student Answers:**
- Use check_spelling to validate
- If correct: Celebrate and explain pattern
- If incorrect: Show what patterns were tricky, give tips

**Decision Making:**
- **Mastering (>90%)**: Skip ahead or advance unit
- **Struggling (<60%)**: Repeat session, focus on weakest pattern
- **Normal (60-90%)**: Continue planned sequence

**Session End:**
- Summarize patterns practiced
- Celebrate progress
- Use update_progress to save
- Use advance_curriculum for next steps

## Communication Style

- Simple sentences for grade level
- Occasional emojis (✨, 🎉, 💡)
- Bite-sized explanations
- Connections to familiar things

Build confidence and love of language! 🌟"""

    return prompt


# Tool definitions
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "show_question",
            "description": "Display a game template to the student",
            "parameters": {
                "type": "object",
                "properties": {
                    "template": {
                        "type": "string",
                        "enum": ["listenAndSpell", "multipleChoice", "patternDetective", "wordBuilder"],
                        "description": "Question template type",
                    },
                    "word": {"type": "string", "description": "Target word"},
                    "pattern": {"type": "string", "description": "Phonics pattern being practiced"},
                    "sound": {"type": "string", "description": "Specific sound variation"},
                    "options": {"type": "array", "items": {"type": "string"}, "description": "Multiple choice options (3-4)"},
                    "context": {"type": "string", "description": "Kid-friendly hint"},
                },
                "required": ["template"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_spelling",
            "description": "Validate student's spelling and identify pattern errors",
            "parameters": {
                "type": "object",
                "properties": {
                    "correct_word": {"type": "string", "description": "Correct spelling"},
                    "student_attempt": {"type": "string", "description": "What student typed"},
                    "target_patterns": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Patterns being practiced",
                    },
                },
                "required": ["correct_word", "student_attempt"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_progress",
            "description": "Update student's progress after session",
            "parameters": {
                "type": "object",
                "properties": {
                    "correct_words": {"type": "array", "items": {"type": "string"}},
                    "incorrect_words": {"type": "array", "items": {"type": "string"}},
                    "pattern_accuracy": {
                        "type": "object",
                        "description": "Pattern -> accuracy (0-1)",
                        "additionalProperties": {"type": "number"},
                    },
                },
                "required": ["correct_words", "incorrect_words", "pattern_accuracy"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_similar_words",
            "description": "Get practice words for a pattern",
            "parameters": {
                "type": "object",
                "properties": {
                    "pattern": {"type": "string", "description": "Phonics pattern"},
                    "sound": {"type": "string", "description": "Sound variation (optional)"},
                    "count": {"type": "number", "description": "How many words (default: 5)"},
                    "difficulty": {"type": "number", "enum": [1, 2, 3, 4, 5], "description": "Difficulty level"},
                },
                "required": ["pattern"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "advance_curriculum",
            "description": "Get next session recommendation",
            "parameters": {
                "type": "object",
                "properties": {
                    "recent_accuracy": {"type": "number", "description": "Session accuracy (0-1)"},
                    "last_session_patterns": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Patterns practiced",
                    },
                },
                "required": ["recent_accuracy", "last_session_patterns"],
            },
        },
    },
]


def handle_tool_call(
    tool_name: str, args: Dict[str, Any], progress: Optional[CurriculumProgress] = None
) -> Dict[str, Any]:
    """Handle a tool call from the agent"""
    try:
        if tool_name == "show_question":
            return {
                "success": True,
                "data": {
                    "template": args["template"],
                    "word": args.get("word"),
                    "pattern": args.get("pattern"),
                    "sound": args.get("sound"),
                    "options": args.get("options"),
                    "context": args.get("context"),
                },
            }

        elif tool_name == "check_spelling":
            correct = args["correct_word"].lower()
            attempt = args["student_attempt"].lower()
            is_correct = correct == attempt

            # Analyze patterns in word
            pattern_analysis = pattern_intelligence.analyze_word(correct)

            return {
                "success": True,
                "data": {
                    "is_correct": is_correct,
                    "correct_word": correct,
                    "student_attempt": attempt,
                    "patterns": [
                        {
                            "pattern": p["pattern"],
                            "sound": p["sound"].pronunciation if isinstance(p["sound"], object) else str(p["sound"]),
                            "confidence": p["confidence"],
                        }
                        for p in pattern_analysis
                    ],
                    "feedback": f"Perfect! '{correct}' is spelled correctly! ✨"
                    if is_correct
                    else f"Not quite. The correct spelling is '{correct}'.",
                },
            }

        elif tool_name == "update_progress":
            if not progress:
                return {"success": False, "error": "No progress context provided"}

            updated_progress = curriculum_engine.update_progress(
                progress,
                {
                    "correct_words": args["correct_words"],
                    "incorrect_words": args["incorrect_words"],
                    "pattern_accuracy": args["pattern_accuracy"],
                },
            )

            total_words = len(args["correct_words"]) + len(args["incorrect_words"])
            accuracy = len(args["correct_words"]) / total_words if total_words > 0 else 0

            return {
                "success": True,
                "data": {
                    "progress": updated_progress.model_dump(),
                    "session_stats": {
                        "total_words": total_words,
                        "correct_words": len(args["correct_words"]),
                        "accuracy": accuracy,
                        "patterns_updated": len(args["pattern_accuracy"]),
                    },
                },
            }

        elif tool_name == "get_similar_words":
            words = pattern_intelligence.get_practice_words(
                args["pattern"],
                args.get("sound"),
                args.get("count", 5),
                args.get("difficulty"),
            )

            return {
                "success": True,
                "data": {
                    "pattern": args["pattern"],
                    "sound": args.get("sound"),
                    "words": words,
                },
            }

        elif tool_name == "advance_curriculum":
            if not progress:
                return {"success": False, "error": "No progress context provided"}

            recommendation = curriculum_engine.get_recommendation(
                progress, args["recent_accuracy"], args["last_session_patterns"]
            )

            return {
                "success": True,
                "data": {
                    "next_focus": recommendation.next_focus,
                    "reasoning": recommendation.reasoning,
                    "estimated_sessions_remaining": recommendation.estimated_sessions_remaining,
                    "session_plan": {
                        "session_number": recommendation.recommended_session.session_number,
                        "focus": recommendation.recommended_session.lesson_plan["focus"],
                    },
                },
            }

        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


def run_coach_spark(
    user_message: str,
    conversation_history: List[Dict],
    progress: CurriculumProgress,
) -> tuple[str, List[Dict], CurriculumProgress]:
    """Run Coach Spark agent with a user message"""
    print(f"\n🎯 run_coach_spark() called")
    print(f"   User message: {user_message[:100]}...")
    print(f"   History length: {len(conversation_history)} messages")

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # Build system prompt
    system_prompt = build_system_prompt(progress.grade, progress)

    # Add user message to history
    conversation_history.append({"role": "user", "content": user_message})

    # Prepare messages
    messages = [{"role": "system", "content": system_prompt}, *conversation_history]

    print(f"🤖 Calling OpenAI GPT-4o with {len(messages)} messages and {len(TOOLS)} tools...")

    # Call OpenAI with tools
    response = client.chat.completions.create(
        model="gpt-4o", messages=messages, tools=TOOLS, tool_choice="auto"
    )

    print(f"📥 OpenAI response received. Finish reason: {response.choices[0].finish_reason}")

    # Handle tool calls
    while response.choices[0].finish_reason == "tool_calls":
        tool_calls = response.choices[0].message.tool_calls

        if not tool_calls:
            break

        # Add assistant message to history
        conversation_history.append(response.choices[0].message.model_dump())

        # Execute each tool call
        for tool_call in tool_calls:
            function_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            print(f"🔧 Tool call: {function_name}({args})")

            # Handle tool call
            result = handle_tool_call(function_name, args, progress)

            # Update progress if needed
            if function_name == "update_progress" and result.get("success"):
                progress = CurriculumProgress(**result["data"]["progress"])

            # Add tool response to history
            conversation_history.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result),
            })

        # Get next response
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": system_prompt}, *conversation_history],
            tools=TOOLS,
            tool_choice="auto",
        )

    # Add final assistant message
    assistant_message = response.choices[0].message.content or ""
    conversation_history.append({"role": "assistant", "content": assistant_message})

    print(f"✅ Agent complete. Response: {len(assistant_message)} chars")

    return (assistant_message, conversation_history, progress)
