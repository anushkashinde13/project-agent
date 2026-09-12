"""
Step 3: Core Tools & In-Memory Agent
====================================
Purpose:
Expand the agent's capabilities with a full tool registry:
  1. `calculate`: Math computation
  2. `get_current_time`: Live timestamp and timezone
  3. `add_task`: Add items to persistent or in-memory task list
  4. `list_tasks`: Read current active tasks
  5. `save_note`: Record notes with title and tags

This script also implements the ReAct loop (Reason -> Act -> Observe).
"""

import os
import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# --- In-Memory State (Agent's Working Memory) ---
TASKS_STORE = []
NOTES_STORE = []

# --- Tool Implementations ---

def calculate(expression: str) -> str:
    """Safely calculate mathematical expressions like '(100 * 1.08) + 25'."""
    try:
        allowed = set("0123456789+-*/(). ")
        if not all(c in allowed for c in expression):
            return f"Error: Disallowed characters in math expression: {expression}"
        return str(eval(expression, {"__builtins__": None}, {}))
    except Exception as e:
        return f"Math Error: {e}"

def get_current_time(timezone_name: str = "UTC") -> str:
    """Get the current system date, time, and day of the week."""
    now = datetime.datetime.now(datetime.timezone.utc)
    return f"Current UTC Time: {now.strftime('%Y-%m-%d %H:%M:%S UTC')} (Day: {now.strftime('%A')})"

def add_task(title: str, priority: str = "normal") -> str:
    """Add a new task to the user's todo list. Priority can be 'low', 'normal', or 'high'."""
    task_id = len(TASKS_STORE) + 1
    task = {
        "id": task_id,
        "title": title,
        "priority": priority,
        "completed": False,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    TASKS_STORE.append(task)
    return f"Task #{task_id} successfully created: '{title}' [Priority: {priority}]"

def list_tasks() -> str:
    """List all current tasks and their status."""
    if not TASKS_STORE:
        return "No tasks found in memory."
    lines = ["Current Tasks:"]
    for t in TASKS_STORE:
        status = "✅ Done" if t["completed"] else "⏳ Pending"
        lines.append(f"- #{t['id']}: {t['title']} ({status}, Priority: {t['priority']})")
    return "\n".join(lines)

def save_note(title: str, content: str, category: str = "general") -> str:
    """Save an important note, snippet, or user reminder into memory."""
    note_id = len(NOTES_STORE) + 1
    note = {
        "id": note_id,
        "title": title,
        "content": content,
        "category": category,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    NOTES_STORE.append(note)
    return f"Note #{note_id} saved: '{title}' in category '{category}'"

# Tool Registry map for runtime execution
ALL_TOOLS = [calculate, get_current_time, add_task, list_tasks, save_note]
TOOL_MAP = {func.__name__: func for func in ALL_TOOLS}

# --- The Agent Loop ---
def run_agent(client: genai.Client, user_goal: str):
    print(f"\n==================================================")
    print(f"🎯 USER GOAL: {user_goal}")
    print(f"==================================================")

    system_instruction = (
        "You are Project Agent, an autonomous personal assistant. "
        "You have access to tools for calculation, current time, tasks, and notes. "
        "Analyze the user's goal, pick the required tools, and when tools return data, "
        "provide a friendly, concise, and accurate answer."
    )

    # Turn 1: Send goal to Gemini with available tools
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=user_goal,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=ALL_TOOLS
        )
    )

    # Check for tool call
    if not response.function_calls:
        print("🤖 Response (Direct answer, no tools needed):")
        print(response.text)
        return

    # Execute all tools requested by the model
    function_responses = []
    for call in response.function_calls:
        name = call.name
        args = call.args
        print(f"\n⚙️ [Agent Action] Calling tool '{name}' with {args}")

        if name in TOOL_MAP:
            result = TOOL_MAP[name](**args)
            print(f"👀 [Agent Observation] Result: {result}")
            function_responses.append(
                types.Part.from_function_response(
                    name=name,
                    response={"result": result}
                )
            )

    # Turn 2: Give results back to Gemini for final reasoning
    followup = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=[
            types.Content(role="user", parts=[types.Part.from_text(text=user_goal)]),
            response.candidates[0].content,
            types.Content(role="user", parts=function_responses)
        ]
    )

    print("\n✅ 💬 Final Agent Response:")
    print(followup.text)

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY environment variable not set.")
        return

    client = genai.Client(api_key=api_key)

    # Example 1: Math calculation
    run_agent(client, "What is 45 times 18, and what is that divided by 3?")

    # Example 2: Current time
    run_agent(client, "What is the current time right now?")

    # Example 3: Adding task and saving note
    run_agent(client, "Add a high-priority task to 'Submit quarterly expense report' and save a note titled 'Finance' with content 'Remember receipts'.")

    # Example 4: List tasks
    run_agent(client, "Can you show me all my current tasks?")

if __name__ == "__main__":
    main()
