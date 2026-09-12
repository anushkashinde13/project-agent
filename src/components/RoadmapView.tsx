import React from "react";
import {
  Milestone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  Github,
  Globe,
  FileCode,
  Lock,
} from "lucide-react";

export const RoadmapView: React.FC = () => {
  const MILESTONES = [
    {
      phase: "Phase 1: Foundations",
      status: "completed",
      title: "Basic Gemini API Integration",
      description: "Send prompts, configure system instructions, and receive model tokens using the official google-genai SDK.",
      deliverable: "step1_basic_gemini.py & Server AI Client",
    },
    {
      phase: "Phase 2: Tooling & The Agent Loop",
      status: "completed",
      title: "Function / Tool Calling Engine",
      description: "Declare function schemas, intercept function call requests from Gemini, execute local code, and feed observations back.",
      deliverable: "step2_function_calling.py & Express Tool Dispatcher",
    },
    {
      phase: "Phase 3: Essential Personal Tools",
      status: "completed",
      title: "Calculator, Clock, Tasks & Notes",
      description: "Build a modular tool registry with mathematical computation, system clock access, and in-memory todo and note management.",
      deliverable: "step3_tools_and_agent.py & Tool Registry",
    },
    {
      phase: "Phase 4: Safety & Quality",
      status: "completed",
      title: "Outcome Verification & Trace Auditing",
      description: "Audit tool execution results before delivering answers to eliminate hallucinations, math errors, and unconfirmed state updates.",
      deliverable: "step4_verification_agent.py & Execution Trace",
    },
    {
      phase: "Phase 5: Advanced Reasoning",
      status: "next",
      title: "Multi-Step Planning & Dependency Graph",
      description: "Enable the agent to decompose a complex composite goal into a dependency tree of sub-goals before invoking tools.",
      deliverable: "DAG Planner Module & Step Coordinator",
    },
    {
      phase: "Phase 6: Human-in-the-Loop",
      status: "planned",
      title: "Permissions & User Confirmation Guard",
      description: "Intercept high-stakes or destructive actions (delete, external message, modify critical state) and require user approval in the UI.",
      deliverable: "Approval Interceptor & Confirmation Modals",
    },
    {
      phase: "Phase 7: Real-World Ecosystem",
      status: "planned",
      title: "External Integrations (GitHub, Calendar, Files)",
      description: "Connect the agent to OAuth Google Calendar, GitHub repository issues/pull requests, and local filesystem tools.",
      deliverable: "OAuth Workspaces, Web Search & GitHub Connectors",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Milestone className="w-4 h-4" />
          <span>Incremental Engineering Roadmap</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Project Agent Evolution Path
        </h2>
        <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
          Building an AI agent is an iterative journey. Here is the architectural roadmap showing what has been built and how future capabilities build on this foundation.
        </p>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {MILESTONES.map((item, index) => {
          const isDone = item.status === "completed";
          const isNext = item.status === "next";

          return (
            <div
              key={index}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? "bg-white border-stone-200 shadow-xs"
                  : isNext
                  ? "bg-amber-50/50 border-amber-300 shadow-xs"
                  : "bg-stone-50/70 border-stone-200 opacity-80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : isNext
                        ? "bg-amber-200 text-amber-900 animate-pulse"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-bold font-mono">{index + 1}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-medium text-stone-500">
                        {item.phase}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          isDone
                            ? "bg-emerald-100 text-emerald-800"
                            : isNext
                            ? "bg-amber-200 text-amber-900"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {isDone ? "Completed & Live" : isNext ? "Next Focus" : "Planned Milestone"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] font-mono text-stone-500 block">Deliverable:</span>
                  <span className="text-xs font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 inline-block mt-0.5">
                    {item.deliverable}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
