"""
Step 2: Function Calling (Tool Use)
==================================
Purpose:
Learn how to empower Gemini with "hands and tools".
Standard LLMs can only output text. By giving them function declarations,
the model can decide:
  1. "I don't know the exact answer from my training data alone."
  2. "I should ask the program to call `calculator(expression='...')`."
  3. The program runs real Python code and gives the result back to Gemini.
  4. Gemini uses that verified result to answer the user.
"""

import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# 1. Define a tool function in standard Python
def calculate(expression: str) -> str:
    """Safely calculate basic arithmetic expressions like '15 * 84.5' or '250 / 4'."""
    try:
        # For safe evaluation in Python, restrict builtins
        allowed_chars = set("0123456789+-*/(). ")
        if not all(c in allowed_chars for c in expression):
            return f"Error: Expression contains forbidden characters: {expression}"
        result = eval(expression, {"__builtins__": None}, {})
        return str(result)
    except Exception as e:
        return f"Error evaluating '{expression}': {str(e)}"

# 2. Tool mapping for dynamic dispatch
TOOL_REGISTRY = {
    "calculate": calculate
}

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY is not set.")
        return

    client = genai.Client(api_key=api_key)

    print("🛠️ Project Agent - Step 2: Function Calling Loop\n")
    user_goal = "What is 15% of $84.50 plus a $5 tip?"
    print(f"Goal: {user_goal}\n")

    # 3. Call model with available tools
    # In the google-genai Python SDK, passing Python functions automatically converts
    # their signature and docstring into Gemini function declarations!
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=user_goal,
        config=types.GenerateContentConfig(
            system_instruction="You are Project Agent. Always use the calculate tool for exact math.",
            tools=[calculate],
        )
    )

    # 4. Check if the model decided to call a function
    if response.function_calls:
        for function_call in response.function_calls:
            tool_name = function_call.name
            tool_args = function_call.args
            print(f"👉 Model decided to call tool: '{tool_name}' with arguments: {tool_args}")

            # 5. Execute our Python code
            if tool_name in TOOL_REGISTRY:
                tool_func = TOOL_REGISTRY[tool_name]
                tool_result = tool_func(**tool_args)
                print(f"📊 Tool execution result: {tool_result}\n")

                # 6. Send the tool result back to Gemini so it can answer the user
                # We provide the conversation history + function response
                followup_response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=[
                        # Original user message
                        types.Content(role="user", parts=[types.Part.from_text(text=user_goal)]),
                        # Model's turn requesting the function call
                        response.candidates[0].content,
                        # Our turn providing the function response
                        types.Content(
                            role="user",
                            parts=[
                                types.Part.from_function_response(
                                    name=tool_name,
                                    response={"result": tool_result}
                                )
                            ]
                        )
                    ]
                )

                print("💬 Final Agent Response:")
                print("----------------------")
                print(followup_response.text)
    else:
        print("No tool call was needed. Model responded directly:")
        print(response.text)

if __name__ == "__main__":
    main()
