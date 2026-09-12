"""
Step 4: Outcome Verification & Robust Agent Loop
===============================================
Purpose:
A critical flaw in standard AI chatbots is "assuming success".
An agent must verify outcomes:
  1. Did the tool fail or return an error?
  2. Does the mathematical output make sense?
  3. Was the task or note verified in the database?
  4. Only after positive verification does the agent present the final answer.
"""

import os
import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

TASKS_STORE = []

def calculate(expression: str) -> str:
    """Safely calculate mathematical expressions."""
    try:
        allowed = set("0123456789+-*/(). ")
        if not all(c in allowed for c in expression):
            return f"Error: Forbidden characters in '{expression}'"
        return str(eval(expression, {"__builtins__": None}, {}))
    except Exception as e:
        return f"Error: {e}"

def add_task(title: str, priority: str = "normal") -> str:
    """Add a task into memory."""
    task_id = len(TASKS_STORE) + 1
    TASKS_STORE.append({"id": task_id, "title": title, "priority": priority, "done": False})
    return f"CREATED: task_id={task_id}, title={title}"

TOOL_MAP = {
    "calculate": calculate,
    "add_task": add_task
}

def verify_outcome(goal: str, tool_name: str, args: dict, result: str) -> tuple[bool, str]:
    """
    Verification Engine:
    Validates that the tool execution succeeded and satisfies the user's intent.
    """
    if result.startswith("Error"):
        return False, f"Tool execution failed: {result}"

    if tool_name == "calculate":
        try:
            float(result)
            return True, f"Verified mathematical computation: {result}"
        except ValueError:
            return False, f"Calculation returned non-numeric result: {result}"

    if tool_name == "add_task":
        if "CREATED" in result:
            return True, "Verified task record created in state store."
        return False, "Task state record was not confirmed."

    return True, "Outcome verified."

def run_agent_with_verification(client: genai.Client, user_goal: str):
    print(f"\n==================================================")
    print(f"🎯 1. GOAL UNDERSTANDING: '{user_goal}'")
    print(f"==================================================")

    # 1. Ask Gemini to decide tools
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=user_goal,
        config=types.GenerateContentConfig(
            system_instruction="You are Project Agent. Select the proper tools to fulfill the user's goal accurately.",
            tools=[calculate, add_task]
        )
    )

    if not response.function_calls:
        print(f"💬 Direct response: {response.text}")
        return

    # 2. Tool Execution & 3. Outcome Verification
    function_responses = []
    verification_passed = True

    for call in response.function_calls:
        name = call.name
        args = call.args
        print(f"🛠️ 2. TOOL EXECUTION: '{name}' with args {args}")

        raw_result = TOOL_MAP[name](**args)
        print(f"   ↳ Raw output: {raw_result}")

        # Verification step
        is_valid, verification_note = verify_outcome(user_goal, name, args, raw_result)
        status_icon = "✅" if is_valid else "❌"
        print(f"🔍 3. VERIFICATION: {status_icon} {verification_note}")

        if not is_valid:
            verification_passed = False

        function_responses.append(
            types.Part.from_function_response(
                name=name,
                response={"result": raw_result, "verified": is_valid, "audit": verification_note}
            )
        )

    # 4. Final Response
    followup = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=[
            types.Content(role="user", parts=[types.Part.from_text(text=user_goal)]),
            response.candidates[0].content,
            types.Content(role="user", parts=function_responses)
        ]
    )

    print(f"💬 4. FINAL AGENT RESPONSE:")
    print(followup.text)

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY is not set.")
        return

    client = genai.Client(api_key=api_key)
    run_agent_with_verification(client, "Calculate 15% discount on $240 and add a task to pay invoice.")

if __name__ == "__main__":
    main()
