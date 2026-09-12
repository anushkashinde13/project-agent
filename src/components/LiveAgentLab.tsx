import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Calculator,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  CheckSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Check,
  Trash2,
} from "lucide-react";
import { AgentRunHistory, AgentTraceStep, TaskItem, NoteItem } from "../types";

interface LiveAgentLabProps {
  history: AgentRunHistory[];
  tasks: TaskItem[];
  notes: NoteItem[];
  isLoading: boolean;
  onRunGoal: (goal: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onClearMemory: () => void;
}

const SAMPLE_GOALS = [
  {
    label: "Math & Calculation",
    prompt: "What is 15% of $84.50 plus a $5 tip?",
    icon: Calculator,
  },
  {
    label: "Time & Date",
    prompt: "What is the current time and what day of the week is it?",
    icon: Clock,
  },
  {
    label: "Task Creation",
    prompt: "Add a high-priority task to 'Submit code review for Project Agent Step 3'",
    icon: CheckSquare,
  },
  {
    label: "Composite (Math + Note)",
    prompt: "Calculate (450 * 1.25) / 4 and save the result as a note titled 'Invoice Estimate'",
    icon: FileText,
  },
];

export const LiveAgentLab: React.FC<LiveAgentLabProps> = ({
  history,
  tasks,
  notes,
  isLoading,
  onRunGoal,
  onToggleTask,
  onDeleteTask,
  onClearMemory,
}) => {
  const [inputGoal, setInputGoal] = useState("");
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim() || isLoading) return;
    onRunGoal(inputGoal.trim());
    setInputGoal("");
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner explaining the Agent Loop */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Autonomous Agent Loop in Action</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Test Project Agent Live
            </h2>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Type any goal below. Watch Project Agent break down the goal, select the appropriate tools
              (Calculator, Time, Tasks, Notes), execute them server-side, verify outcomes, and provide an accurate response.
            </p>
          </div>

          {/* Loop Stages visual pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs bg-stone-800/80 p-2.5 rounded-xl border border-stone-700/60 self-start md:self-auto">
            <span className="flex items-center text-stone-300 font-medium">
              <span className="w-4 h-4 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center mr-1 text-[10px]">1</span>
              Goal
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="flex items-center text-amber-300 font-medium">
              <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 flex items-center justify-center mr-1 text-[10px]">2</span>
              Tool Call
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="flex items-center text-emerald-300 font-medium">
              <span className="w-4 h-4 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center mr-1 text-[10px]">3</span>
              Verify
            </span>
            <ArrowRight className="w-3 h-3 text-stone-500" />
            <span className="flex items-center text-sky-300 font-medium">
              <span className="w-4 h-4 rounded-full bg-sky-900/60 text-sky-300 flex items-center justify-center mr-1 text-[10px]">4</span>
              Answer
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Interaction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt Input Form */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label htmlFor="agent-goal-input" className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
                What would you like Project Agent to do?
              </label>
              <div className="relative">
                <textarea
                  id="agent-goal-input"
                  rows={2}
                  value={inputGoal}
                  onChange={(e) => setInputGoal(e.target.value)}
                  placeholder="e.g. Calculate 18% tax on $250 and add a high-priority task to send the invoice."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-sm text-stone-900 placeholder:text-stone-400 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  id="submit-goal-btn"
                  type="submit"
                  disabled={!inputGoal.trim() || isLoading}
                  className="absolute right-2.5 bottom-3.5 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Execute</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Goals */}
              <div>
                <span className="text-xs text-stone-400 font-medium block mb-2">Try quick examples:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_GOALS.map((sample, idx) => {
                    const Icon = sample.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputGoal(sample.prompt)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs rounded-lg transition-colors border border-stone-200 text-left"
                      >
                        <Icon className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>{sample.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          {/* Loading Animation during active run */}
          {isLoading && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center mx-auto mb-3">
                <Cpu className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-stone-800">Agent Loop Active</p>
              <p className="text-xs text-stone-500 mt-1">
                Analyzing goal → Checking tool schemas → Invoking function → Verifying outcome...
              </p>
            </div>
          )}

          {/* Run History / Agent Turns */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
                Execution Log & Agent Turns ({history.length})
              </h3>
              {history.length > 0 && (
                <span className="text-xs text-stone-500">Most recent on top</span>
              )}
            </div>

            {history.length === 0 && !isLoading && (
              <div className="bg-white rounded-2xl p-8 border border-dashed border-stone-300 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-stone-900">No agent runs yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Enter a goal above or click one of the quick examples to watch Project Agent select tools, execute them, and verify the outcome.
                </p>
              </div>
            )}

            {history.map((run, runIndex) => {
              const isExpanded = expandedTraceId === run.id || (runIndex === 0 && expandedTraceId === null);

              return (
                <div
                  key={run.id}
                  id={`agent-run-card-${run.id}`}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Goal Header */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        #{history.length - runIndex}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Goal
                          </span>
                          <span className="text-xs text-stone-400">• {run.timestamp}</span>
                        </div>
                        <p className="text-sm font-semibold text-stone-900 mt-0.5">
                          "{run.goal}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleTrace(run.id)}
                      className="inline-flex items-center space-x-1 text-xs text-stone-600 hover:text-stone-900 bg-white px-2.5 py-1 rounded-md border border-stone-200 transition-colors"
                    >
                      <span>{isExpanded ? "Collapse Trace" : "Inspect Trace"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Intermediate Trace Steps (The Agent Loop) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-stone-50/50 border-b border-stone-200 space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 flex items-center space-x-1.5">
                        <Cpu className="w-3.5 h-3.5 text-stone-600" />
                        <span>Internal Execution Trace</span>
                      </div>

                      <div className="space-y-2.5">
                        {run.steps.map((step) => {
                          let badgeBg = "bg-stone-100 text-stone-700 border-stone-200";
                          let icon = <Cpu className="w-3.5 h-3.5" />;

                          if (step.phase === "tool_decision") {
                            badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
                            icon = <Calculator className="w-3.5 h-3.5 text-amber-600" />;
                          } else if (step.phase === "tool_execution") {
                            badgeBg = "bg-sky-50 text-sky-800 border-sky-200";
                            icon = <CheckSquare className="w-3.5 h-3.5 text-sky-600" />;
                          } else if (step.phase === "verification") {
                            badgeBg = step.status === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200";
                            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
                          }

                          return (
                            <div
                              key={step.id}
                              className={`p-3 rounded-xl border text-xs ${badgeBg} space-y-1.5`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center space-x-1.5">
                                  {icon}
                                  <span>{step.title}</span>
                                </span>
                                <span className="text-[11px] opacity-75 font-mono">{step.timestamp}</span>
                              </div>
                              <p className="text-stone-700 text-xs leading-relaxed">{step.detail}</p>
                              {step.data && (
                                <pre className="mt-1 p-2 rounded-lg bg-stone-900 text-stone-200 text-[11px] font-mono overflow-x-auto">
                                  {JSON.stringify(step.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Final Response Card */}
                  <div className="p-4 sm:p-5 bg-white">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Agent Response</span>
                    </div>
                    <div className="text-sm text-stone-800 leading-relaxed whitespace-pre-line font-normal">
                      {run.finalResponse}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Working Memory & State Inspector */}
        <div className="space-y-6">
          {/* Active Tasks Widget */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Agent Tasks Memory ({tasks.length})
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">In-Memory</span>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2">
                No tasks created yet. Ask the agent to add a task!
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      task.completed
                        ? "bg-stone-50 border-stone-200 text-stone-400"
                        : "bg-white border-stone-200 text-stone-800 shadow-2xs"
                    }`}
                  >
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="flex items-start space-x-2 text-left flex-1 mr-2 cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                          task.completed
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-stone-300 bg-white"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className={task.completed ? "line-through text-stone-400" : "font-medium text-stone-800"}>
                          {task.title}
                        </p>
                        <span
                          className={`inline-block mt-1 px-1.5 py-0.2 rounded-md text-[10px] uppercase font-semibold ${
                            task.priority === "high"
                              ? "bg-rose-100 text-rose-700"
                              : task.priority === "low"
                              ? "bg-stone-100 text-stone-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Notes Widget */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Agent Notes Memory ({notes.length})
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">In-Memory</span>
            </div>

            {notes.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-2">
                No notes saved yet. Ask the agent to save notes!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{note.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-700 font-medium">
                        {note.category}
                      </span>
                    </div>
                    <p className="text-stone-600 text-xs leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reset State Control */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-800">Clear Memory State</p>
              <p className="text-[11px] text-stone-500">Reset tasks and notes in memory</p>
            </div>
            <button
              onClick={onClearMemory}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
