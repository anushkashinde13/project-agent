# Project Agent: Incremental Learning Guide

Welcome to **Project Agent**! This guide takes you from complete beginner to understanding how autonomous AI agents work, starting with Python scripts and progressing into a full-stack web application.

---

## 🧭 The Core Difference: Chatbot vs. Agent

| Feature | Standard Chatbot | Project Agent |
| :--- | :--- | :--- |
| **Action** | Only predicts and outputs words | Decides which tools to run and executes code |
| **Math & Logic**| Hallucinates or guesses numbers | Uses a real Calculator tool for 100% precision |
| **Real World** | Static training cutoff | Reads real time, interacts with APIs & storage |
| **Memory** | Lost when context resets | Manages persistent tasks, notes, and records |
| **Safety** | Assumes output is correct | Verifies tool outcomes before answering |

---

## 🪜 The Incremental Learning Path

### Step 1: Basic Gemini API Call (`step1_basic_gemini.py`)
- **Key concept**: `client = genai.Client(api_key=...)`
- **What it does**: Sends a prompt to Gemini 3.8 Flash and prints the text response.
- **Why it matters**: Foundation for talking to LLMs.

### Step 2: Function Calling (`step2_function_calling.py`)
- **Key concept**: Tool registration and the two-step turn.
- **The Agent Loop**:
  1. User asks: *"What is 15% of $84.50 plus $5 tip?"*
  2. Gemini responds: *"Please run `calculate(expression='84.50 * 0.15 + 5')`"*
  3. Your Python code executes `calculate(...)` and gets `17.675`.
  4. You send `17.675` back to Gemini.
  5. Gemini crafts the final answer with 100% accurate math.

### Step 3: Core Tools & In-Memory State (`step3_tools_and_agent.py`)
- **Key concept**: Equipping the agent with practical daily tools:
  - `calculate`: Math computation
  - `get_current_time`: Dynamic time/date access
  - `add_task` & `list_tasks`: In-memory task management
  - `save_note`: Structured note storage
- **Why it matters**: An agent needs multiple tools to solve composite goals.

### Step 4: Outcome Verification (`step4_verification_agent.py`)
- **Key concept**: Validating tool executions before presenting answers.
- **Why it matters**: Ensures the agent detects tool errors, invalid parameters, or state mismatches before misleading the user.

---

## 🚀 Running the Python Scripts Locally

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set your Gemini API key:
   ```bash
   export GEMINI_API_KEY="your-api-key"
   ```
4. Run any step:
   ```bash
   python step1_basic_gemini.py
   python step2_function_calling.py
   python step3_tools_and_agent.py
   python step4_verification_agent.py
   ```
