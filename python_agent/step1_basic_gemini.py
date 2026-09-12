"""
Step 1: Basic Gemini API Integration
====================================
Purpose:
Learn how to connect to Google's Gemini models using the official `google-genai` Python SDK.
This is the baseline foundation of any AI application before adding agentic capabilities.

Prerequisites:
  pip install google-genai python-dotenv
  export GEMINI_API_KEY="your-api-key-here"
"""

import os
from google import genai
from dotenv import load_dotenv

# 1. Load environment variables (e.g. GEMINI_API_KEY from .env)
load_dotenv()

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY is not set. Please set it in your environment or .env file.")
        return

    # 2. Initialize the Gemini Client
    # The client handles authentication and HTTP transport under the hood.
    client = genai.Client(api_key=api_key)

    print("🚀 Project Agent - Step 1: Basic Gemini Call\n")
    user_prompt = "Explain in 2 sentences what an autonomous AI Agent is compared to a standard chatbot."

    print(f"Prompt: {user_prompt}\n")

    # 3. Call the model
    # We use 'gemini-3.8-flash', Google's fast and smart model ideal for agent tasks.
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=user_prompt,
        config={
            # System instructions shape the personality and guidelines of the model
            "system_instruction": "You are Project Agent, a focused and concise software engineering mentor.",
            "temperature": 0.7,
        }
    )

    # 4. Print response text
    print("Response from Gemini:")
    print("---------------------")
    print(response.text)

if __name__ == "__main__":
    main()
