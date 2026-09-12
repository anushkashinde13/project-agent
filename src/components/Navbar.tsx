import React from "react";
import { Bot, Sparkles, BookOpen, Database, Milestone, Terminal } from "lucide-react";

interface NavbarProps {
  activeTab: "agent" | "education" | "memory" | "roadmap";
  setActiveTab: (tab: "agent" | "education" | "memory" | "roadmap") => void;
  taskCount: number;
  noteCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  taskCount,
  noteCount,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-stone-900 text-lg tracking-tight">Project Agent</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                AI Agent with Tool Calling, Verification & Incremental Architecture
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="nav-agent-lab-btn"
              onClick={() => setActiveTab("agent")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "agent"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Live Agent Lab</span>
            </button>

            <button
              id="nav-learning-lab-btn"
              onClick={() => setActiveTab("education")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "education"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Python & Concepts</span>
            </button>

            <button
              id="nav-memory-store-btn"
              onClick={() => setActiveTab("memory")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "memory"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Memory & Tools</span>
              {(taskCount > 0 || noteCount > 0) && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-amber-100 text-amber-800 font-medium">
                  {taskCount + noteCount}
                </span>
              )}
            </button>

            <button
              id="nav-roadmap-btn"
              onClick={() => setActiveTab("roadmap")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "roadmap"
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Milestone className="w-4 h-4" />
              <span>Roadmap</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
