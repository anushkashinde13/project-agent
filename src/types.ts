export interface TaskItem {
  id: number;
  title: string;
  priority: "low" | "normal" | "high";
  completed: boolean;
  createdAt: string;
}

export interface NoteItem {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface AgentTraceStep {
  id: string;
  phase: "goal_received" | "tool_decision" | "tool_execution" | "verification" | "final_response";
  title: string;
  detail: string;
  data?: any;
  status?: "pending" | "success" | "warning" | "error";
  timestamp: string;
}

export interface AgentRunHistory {
  id: string;
  goal: string;
  timestamp: string;
  finalResponse: string;
  steps: AgentTraceStep[];
}

export interface EducationalModule {
  id: string;
  title: string;
  stage: string;
  summary: string;
  concepts: string[];
  pythonCode: string;
  explanation: string;
}

export interface ToolDefinition {
  name: string;
  label: string;
  description: string;
  examples: string[];
}
