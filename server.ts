import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Storage for Personal Agent Tasks & Notes
interface TaskItem {
  id: number;
  title: string;
  priority: "low" | "normal" | "high";
  completed: boolean;
  createdAt: string;
}

interface NoteItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

interface AgentTraceStep {
  id: string;
  phase: "goal_received" | "tool_decision" | "tool_execution" | "verification" | "final_response";
  title: string;
  detail: string;
  data?: any;
  status?: "pending" | "success" | "warning" | "error";
  timestamp: string;
}

const memoryStore = {
  tasks: [
    {
      id: 1,
      title: "Explore Project Agent architecture",
      priority: "high" as const,
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Test calculator and time tools",
      priority: "normal" as const,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ] as TaskItem[],
  notes: [
    {
      id: 1,
      title: "Agent vs Chatbot Architecture",
      content: "An agent has an active loop: Understand Goal -> Select Tool -> Execute -> Verify Outcome -> Synthesize Response.",
      category: "Architecture",
      createdAt: new Date().toISOString(),
    }
  ] as NoteItem[],
  nextTaskId: 3,
  nextNoteId: 2,
};

// Tool Definitions for Gemini API
const calculatorDeclaration: FunctionDeclaration = {
  name: "calculator",
  description: "Accurately calculate mathematical expressions (e.g., '15 * 84.5 + 5', '(240 - 35) * 1.08', 'sqrt(144)', '500 * 0.15').",
  parameters: {
    type: Type.OBJECT,
    properties: {
      expression: {
        type: Type.STRING,
        description: "The mathematical formula to compute, using digits and +, -, *, /, %, (), sqrt, pow.",
      },
    },
    required: ["expression"],
  },
};

const getCurrentTimeDeclaration: FunctionDeclaration = {
  name: "get_current_time",
  description: "Get the current local and UTC date, time, and day of week.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      timezone: {
        type: Type.STRING,
        description: "Optional timezone identifier or label (e.g. 'UTC', 'EST', 'Local').",
      },
    },
  },
};

const manageTasksDeclaration: FunctionDeclaration = {
  name: "manage_tasks",
  description: "Manage personal todo tasks. Can add new tasks, list existing tasks, complete a task, or delete a task.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "Action to perform: 'add', 'list', 'complete', or 'delete'.",
      },
      title: {
        type: Type.STRING,
        description: "The task title/description (required for 'add').",
      },
      priority: {
        type: Type.STRING,
        description: "Priority level: 'low', 'normal', or 'high'. Default is 'normal'.",
      },
      taskId: {
        type: Type.NUMBER,
        description: "The task id number (required for 'complete' or 'delete').",
      },
    },
    required: ["action"],
  },
};

const manageNotesDeclaration: FunctionDeclaration = {
  name: "manage_notes",
  description: "Manage notes and saved records. Can save a new note, list all notes, or search notes by keyword.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "Action to perform: 'save', 'list', or 'search'.",
      },
      title: {
        type: Type.STRING,
        description: "Title of the note (required for 'save').",
      },
      content: {
        type: Type.STRING,
        description: "Body or details of the note (required for 'save').",
      },
      category: {
        type: Type.STRING,
        description: "Category or tag for organization (e.g., 'Work', 'Finance', 'Ideas').",
      },
      query: {
        type: Type.STRING,
        description: "Keyword to search for in titles or note content (for 'search').",
      },
    },
    required: ["action"],
  },
};

// Safe Local Tool Handlers
function executeCalculator(expression: string): { output: string; verified: boolean; audit: string } {
  try {
    const sanitized = expression
      .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
      .replace(/pow\(([^,]+),([^)]+)\)/g, "Math.pow($1,$2)")
      .replace(/%/g, "/100");

    // Only allow safe math tokens
    const allowedChars = /^[0-9+\-*/()., Math.sqrtpow\s]+$/;
    if (!allowedChars.test(sanitized)) {
      return {
        output: "Error: Expression contains disallowed characters for security.",
        verified: false,
        audit: "Rejected unsafe formula characters.",
      };
    }

    const func = new Function(`"use strict"; return (${sanitized});`);
    const val = func();
    if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
      return {
        output: `Error: Computed non-finite or invalid number (${val})`,
        verified: false,
        audit: "Math engine detected NaN or infinity.",
      };
    }

    const formatted = Math.round((val + Number.EPSILON) * 1000000) / 1000000;
    return {
      output: String(formatted),
      verified: true,
      audit: `Mathematical evaluation verified: ${expression} = ${formatted}`,
    };
  } catch (err: any) {
    return {
      output: `Math Error: ${err.message}`,
      verified: false,
      audit: `Calculation exception: ${err.message}`,
    };
  }
}

function executeGetTime(timezone?: string): { output: string; verified: boolean; audit: string } {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
  const utcStr = now.toUTCString();

  const output = `Current Time: ${timeStr} (${dateStr}) | UTC: ${utcStr}`;
  return {
    output,
    verified: true,
    audit: `System clock validated: ${now.toISOString()}`,
  };
}

function executeManageTasks(args: { action: string; title?: string; priority?: string; taskId?: number }): {
  output: string;
  verified: boolean;
  audit: string;
} {
  const action = args.action?.toLowerCase();

  if (action === "add") {
    if (!args.title || args.title.trim() === "") {
      return { output: "Error: Task title is required to add a task.", verified: false, audit: "Missing title parameter." };
    }
    const newTask: TaskItem = {
      id: memoryStore.nextTaskId++,
      title: args.title.trim(),
      priority: (["low", "normal", "high"].includes(args.priority || "") ? args.priority : "normal") as any,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    memoryStore.tasks.unshift(newTask);
    return {
      output: `Task #${newTask.id} successfully created: "${newTask.title}" [Priority: ${newTask.priority}]`,
      verified: true,
      audit: `State store updated: Task #${newTask.id} added. Current total: ${memoryStore.tasks.length} tasks.`,
    };
  }

  if (action === "complete") {
    const id = Number(args.taskId);
    const task = memoryStore.tasks.find((t) => t.id === id);
    if (!task) {
      return { output: `Error: Task with ID ${args.taskId} not found.`, verified: false, audit: `Task ID #${args.taskId} does not exist.` };
    }
    task.completed = true;
    return {
      output: `Task #${task.id} ("${task.title}") marked as complete.`,
      verified: true,
      audit: `State updated: Task #${task.id} completed status is true.`,
    };
  }

  if (action === "delete") {
    const id = Number(args.taskId);
    const index = memoryStore.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return { output: `Error: Task with ID ${args.taskId} not found.`, verified: false, audit: `Task ID #${args.taskId} not found.` };
    }
    const removed = memoryStore.tasks.splice(index, 1)[0];
    return {
      output: `Task #${removed.id} ("${removed.title}") deleted from list.`,
      verified: true,
      audit: `State updated: Task #${removed.id} removed.`,
    };
  }

  // default: list
  if (memoryStore.tasks.length === 0) {
    return { output: "There are currently no tasks in your todo list.", verified: true, audit: "Task list query returned 0 items." };
  }
  const summary = memoryStore.tasks
    .map((t) => `[#${t.id}] ${t.completed ? "✓" : "○"} ${t.title} (${t.priority})`)
    .join("\n");
  return {
    output: `Current Tasks (${memoryStore.tasks.length}):\n${summary}`,
    verified: true,
    audit: `Retrieved ${memoryStore.tasks.length} task records from memory.`,
  };
}

function executeManageNotes(args: { action: string; title?: string; content?: string; category?: string; query?: string }): {
  output: string;
  verified: boolean;
  audit: string;
} {
  const action = args.action?.toLowerCase();

  if (action === "save") {
    if (!args.title || !args.content) {
      return { output: "Error: Both title and content are required to save a note.", verified: false, audit: "Missing note parameters." };
    }
    const newNote: NoteItem = {
      id: memoryStore.nextNoteId++,
      title: args.title.trim(),
      content: args.content.trim(),
      category: args.category?.trim() || "General",
      createdAt: new Date().toISOString(),
    };
    memoryStore.notes.unshift(newNote);
    return {
      output: `Note #${newNote.id} saved: "${newNote.title}" in category [${newNote.category}]`,
      verified: true,
      audit: `State store updated: Note #${newNote.id} persisted. Total notes: ${memoryStore.notes.length}.`,
    };
  }

  if (action === "search") {
    const q = (args.query || "").toLowerCase();
    const matched = memoryStore.notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)
    );
    if (matched.length === 0) {
      return { output: `No notes matched search query: "${args.query}"`, verified: true, audit: `Search found 0 matching notes.` };
    }
    const resultText = matched.map((n) => `[#${n.id}] ${n.title} (${n.category}): ${n.content}`).join("\n---\n");
    return {
      output: `Found ${matched.length} notes matching "${args.query}":\n${resultText}`,
      verified: true,
      audit: `Search found ${matched.length} matching notes.`,
    };
  }

  // default: list
  if (memoryStore.notes.length === 0) {
    return { output: "No notes currently saved in memory.", verified: true, audit: "Note list query returned 0 items." };
  }
  const summary = memoryStore.notes.map((n) => `[#${n.id}] ${n.title} (${n.category})`).join("\n");
  return {
    output: `Saved Notes (${memoryStore.notes.length}):\n${summary}`,
    verified: true,
    audit: `Retrieved ${memoryStore.notes.length} note records from memory.`,
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Project Agent API", model: "gemini-3.8-flash" });
});

// 2. Current State endpoint
app.get("/api/agent/state", (_req: Request, res: Response) => {
  res.json({
    tasks: memoryStore.tasks,
    notes: memoryStore.notes,
    availableTools: [
      {
        name: "calculator",
        label: "Mathematical Calculator",
        description: "Executes precise arithmetic, percentages, and mathematical logic.",
        examples: ["15% tip on $84.50", "(450 * 1.25) / 4"],
      },
      {
        name: "get_current_time",
        label: "System Clock & Time",
        description: "Fetches live time, date, day of week, and timezone information.",
        examples: ["What time is it right now?", "What is today's date?"],
      },
      {
        name: "manage_tasks",
        label: "Task & Todo Memory",
        description: "Creates, lists, completes, and removes tasks from working memory.",
        examples: ["Add a high priority task to review PR", "List all my current tasks"],
      },
      {
        name: "manage_notes",
        label: "Notes & Knowledge Store",
        description: "Saves structured notes, categorizes findings, and searches saved items.",
        examples: ["Save note titled 'Server Config' with 'Port 3000'", "Search notes for architecture"],
      },
    ],
  });
});

// 3. Task management direct controls for UI
app.post("/api/agent/task/toggle", (req: Request, res: Response) => {
  const { id } = req.body;
  const task = memoryStore.tasks.find((t) => t.id === Number(id));
  if (task) {
    task.completed = !task.completed;
    return res.json({ success: true, task });
  }
  return res.status(404).json({ error: "Task not found" });
});

app.post("/api/agent/task/delete", (req: Request, res: Response) => {
  const { id } = req.body;
  const index = memoryStore.tasks.findIndex((t) => t.id === Number(id));
  if (index !== -1) {
    const removed = memoryStore.tasks.splice(index, 1)[0];
    return res.json({ success: true, removed });
  }
  return res.status(404).json({ error: "Task not found" });
});

app.post("/api/agent/clear-memory", (_req: Request, res: Response) => {
  memoryStore.tasks = [];
  memoryStore.notes = [];
  res.json({ success: true, message: "Agent memory cleared." });
});

// 4. Run the Agent Loop with verification
app.post("/api/agent/run", async (req: Request, res: Response) => {
  const { goal } = req.body;

  if (!goal || typeof goal !== "string" || goal.trim() === "") {
    return res.status(400).json({ error: "User goal/prompt is required." });
  }

  const steps: AgentTraceStep[] = [];
  const addStep = (
    phase: AgentTraceStep["phase"],
    title: string,
    detail: string,
    data?: any,
    status: AgentTraceStep["status"] = "success"
  ) => {
    steps.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      phase,
      title,
      detail,
      data,
      status,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Phase 1: Record received goal
  addStep("goal_received", "Goal Received", `Analyzing goal: "${goal}"`, { goal }, "success");

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      addStep("tool_decision", "API Key Check", "GEMINI_API_KEY is not configured.", null, "error");
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured.",
        steps,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are Project Agent, an autonomous personal AI agent.
Your primary role is to help the user achieve their goals by:
1. Understanding the user's intent.
2. Selecting and calling the appropriate tools from your registry:
   - 'calculator': Use for ALL math expressions and numbers. NEVER guess or estimate calculations.
   - 'get_current_time': Use when the user asks about the time, date, day of the week, or current moment.
   - 'manage_tasks': Use to add, list, complete, or delete personal todo items.
   - 'manage_notes': Use to save, search, or list personal notes.
3. Reviewing the tool results and verifying the outcome.
4. Delivering a clear, grounded, concise response to the user.
If multiple actions are requested in a single prompt (e.g. calculate and save a task), call all required tools.
If no tool is needed (e.g. greetings, conceptual explanations), provide a concise and helpful direct response.`;

    async function callGeminiWithRetry(params: any, retries = 3, delay = 1000): Promise<any> {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await ai.models.generateContent(params);
        } catch (err: any) {
          const isTransient =
            err?.message?.includes("503") ||
            err?.message?.includes("UNAVAILABLE") ||
            err?.message?.includes("high demand") ||
            err?.status === 503;
          if (attempt < retries && isTransient) {
            await new Promise((resolve) => setTimeout(resolve, delay * attempt));
            continue;
          }
          throw err;
        }
      }
    }

    // 1st Turn: Give model the goal and tools
    const response = await callGeminiWithRetry({
      model: "gemini-3.8-flash",
      contents: goal,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [
          {
            functionDeclarations: [
              calculatorDeclaration,
              getCurrentTimeDeclaration,
              manageTasksDeclaration,
              manageNotesDeclaration,
            ],
          },
        ],
      },
    });

    const functionCalls = response.functionCalls;

    if (!functionCalls || functionCalls.length === 0) {
      // Direct model response without tool execution
      const directText = response.text || "I have analyzed your request and provided a response.";
      addStep(
        "final_response",
        "Direct Response",
        "No tool execution was required for this goal. Direct response synthesized.",
        { text: directText },
        "success"
      );

      return res.json({
        finalResponse: directText,
        steps,
        tasks: memoryStore.tasks,
        notes: memoryStore.notes,
      });
    }

    // Phase 2: Execute each tool call
    const functionResponses: any[] = [];
    let allVerified = true;

    for (const call of functionCalls) {
      const toolName = call.name;
      const toolArgs = (call.args as Record<string, any>) || {};

      addStep(
        "tool_decision",
        `Tool Selected: ${toolName}`,
        `Model selected ${toolName} with arguments: ${JSON.stringify(toolArgs)}`,
        { toolName, toolArgs },
        "pending"
      );

      let executionResult: { output: string; verified: boolean; audit: string };

      if (toolName === "calculator") {
        executionResult = executeCalculator(toolArgs.expression || "");
      } else if (toolName === "get_current_time") {
        executionResult = executeGetTime(toolArgs.timezone);
      } else if (toolName === "manage_tasks") {
        executionResult = executeManageTasks(toolArgs as any);
      } else if (toolName === "manage_notes") {
        executionResult = executeManageNotes(toolArgs as any);
      } else {
        executionResult = {
          output: `Error: Unknown tool '${toolName}'`,
          verified: false,
          audit: `Tool '${toolName}' is not in the active registry.`,
        };
      }

      // Phase 3: Tool Execution Log
      addStep(
        "tool_execution",
        `Tool Executed: ${toolName}`,
        `Output: ${executionResult.output}`,
        { toolName, args: toolArgs, output: executionResult.output },
        executionResult.verified ? "success" : "error"
      );

      // Phase 4: Outcome Verification Log
      addStep(
        "verification",
        `Outcome Verification: ${toolName}`,
        executionResult.audit,
        { toolName, verified: executionResult.verified, audit: executionResult.audit },
        executionResult.verified ? "success" : "warning"
      );

      if (!executionResult.verified) {
        allVerified = false;
      }

      functionResponses.push({
        functionResponse: {
          name: toolName,
          response: {
            result: executionResult.output,
            verified: executionResult.verified,
            verificationAudit: executionResult.audit,
          },
        },
      });
    }

    // Phase 5: Second turn - feed tool outputs back to Gemini for final grounded synthesis
    const candidateContent = response.candidates?.[0]?.content;
    if (!candidateContent) {
      throw new Error("No candidate content received from model during tool turn.");
    }

    const followUpResponse = await callGeminiWithRetry({
      model: "gemini-3.8-flash",
      contents: [
        { role: "user", parts: [{ text: goal }] },
        candidateContent,
        { role: "user", parts: functionResponses },
      ],
      config: {
        systemInstruction: `${systemInstruction}\nThe tool results have been executed and verified. Summarize the outcome clearly for the user. Mention the exact verified numbers and items created.`,
      },
    });

    const finalText = followUpResponse.text || "Goal completed successfully.";

    addStep(
      "final_response",
      "Outcome Verified & Responded",
      allVerified
        ? "All tool actions verified successfully. Grounded response delivered."
        : "Some tool actions reported warnings or required attention.",
      { text: finalText },
      allVerified ? "success" : "warning"
    );

    return res.json({
      finalResponse: finalText,
      steps,
      tasks: memoryStore.tasks,
      notes: memoryStore.notes,
    });
  } catch (error: any) {
    console.error("Agent execution error:", error);
    addStep("final_response", "Agent Error", `An error occurred: ${error.message}`, { error: error.message }, "error");
    return res.status(500).json({
      error: error.message || "Failed to execute agent loop.",
      steps,
      tasks: memoryStore.tasks,
      notes: memoryStore.notes,
    });
  }
});

// 5. Educational Modules endpoint (delivering code and tutorials to the UI)
app.get("/api/education/modules", (_req: Request, res: Response) => {
  res.json([
    {
      id: "step1",
      title: "Step 1: Connecting to Gemini API",
      stage: "Foundation",
      summary: "Understand the basics of sending prompts and receiving text from Gemini models.",
      concepts: [
        "LLMs predict tokens based on prompts",
        "API Keys authenticate your requests securely",
        "System Instructions calibrate model behavior and role",
        "Temperature controls deterministic vs creative responses",
      ],
      pythonCode: `from google import genai
import os

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="Explain what an AI agent is in 2 sentences.",
    config={"system_instruction": "You are Project Agent."}
)
print(response.text)`,
      explanation:
        "The first step is establishing communication. We use the modern 'google-genai' SDK. The model 'gemini-3.8-flash' receives our prompt and returns text. At this stage, it is just a chatbot—it cannot take actions or interact with tools.",
    },
    {
      id: "step2",
      title: "Step 2: Function Calling (Tool Use)",
      stage: "The Agent Loop",
      summary: "Empower the model with tools so it can run code instead of guessing.",
      concepts: [
        "Tools are declared with schemas (name, description, parameters)",
        "The model doesn't execute code directly—it emits a structured call request",
        "Your application executes the real Python/Node code safely",
        "The result is sent back to the model to generate the final response",
      ],
      pythonCode: `def calculate(expression: str) -> str:
    """Safely calculate basic arithmetic expressions."""
    return str(eval(expression, {"__builtins__": None}, {}))

# In Gemini SDK, passing Python functions automatically generates tool schemas!
response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents="What is 15% of $84.50 plus $5 tip?",
    config=types.GenerateContentConfig(tools=[calculate])
)

# If the model requested a tool call:
if response.function_calls:
    for call in response.function_calls:
        result = calculate(**call.args)
        # Send result back in Turn 2 to get verified answer`,
      explanation:
        "Function calling transforms a chatbot into an agent. When asked for math, the model knows it lacks a calculator, so it outputs a function call request. Your server runs the calculation and feeds the result back.",
    },
    {
      id: "step3",
      title: "Step 3: Tool Registry & In-Memory State",
      stage: "Tools & Working Memory",
      summary: "Provide practical tools (Math, System Time, Tasks, Notes) and maintain working memory.",
      concepts: [
        "Tool Registry: mapping function names to callable handlers",
        "State Stores: in-memory or database records for tasks and notes",
        "Multi-tool execution: handling multiple tool calls in a single user request",
      ],
      pythonCode: `TASKS_STORE = []

def add_task(title: str, priority: str = "normal") -> str:
    task_id = len(TASKS_STORE) + 1
    TASKS_STORE.append({"id": task_id, "title": title, "priority": priority})
    return f"Task #{task_id} added: {title}"

def get_current_time(tz: str = "UTC") -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

# Agent now has calculator, time, and task management!`,
      explanation:
        "Real personal agents need to interact with user data. Here we establish in-memory collections for tasks and notes. When the user says 'Add a task to call Alex and calculate my invoice', the agent can invoke both tools sequentially or in parallel.",
    },
    {
      id: "step4",
      title: "Step 4: Outcome Verification",
      stage: "Reliability & Safety",
      summary: "Audit and verify tool results before delivering answers to prevent hallucinations.",
      concepts: [
        "Tool Output Auditing: checking for errors, null values, or unexpected types",
        "State Consistency: verifying database records actually exist",
        "Verification Feedback: notifying the model if a tool failed so it can self-correct",
      ],
      pythonCode: `def verify_outcome(goal, tool_name, args, result):
    if result.startswith("Error"):
        return False, "Execution error occurred"
    if tool_name == "calculate":
        try:
            float(result)
            return True, f"Verified numerical value: {result}"
        except ValueError:
            return False, "Non-numerical computation"
    return True, "Verified state update"`,
      explanation:
        "Standard chatbots hallucinate confidence even when things fail. Project Agent audits every tool invocation. If an operation fails, the verification step catches it, preventing misleading information.",
    },
    {
      id: "step5",
      title: "Step 5: Roadmap to Production",
      stage: "Full Web Application & Integrations",
      summary: "Multi-step planning, human permissions, and integrations (GitHub, Files, Calendar).",
      concepts: [
        "Multi-step Planner: breaking complex goals into an ordered dependency tree",
        "Human-in-the-Loop: requiring user approval before destructive actions (delete, send email)",
        "Durable Database: replacing in-memory arrays with persistent Firestore or SQL",
        "External APIs: connecting Google Calendar, GitHub PRs, and Web Search",
      ],
      pythonCode: `# Future Milestone: Human Confirmation Guard
def execute_with_permission(action, params):
    if action in ["delete_task", "send_email", "push_git"]:
        prompt_user_for_confirmation(action, params)
    else:
        execute_directly(action, params)`,
      explanation:
        "As Project Agent matures into a full-scale personal system, human confirmation protects private data, while integrations with Calendar and GitHub make it a true digital companion.",
    },
  ]);
});

// Vite Middleware for Development vs Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Project Agent server running on http://localhost:${PORT}`);
  });
}

startServer();
