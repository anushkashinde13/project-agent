/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LiveAgentLab } from "./components/LiveAgentLab";
import { EducationLab } from "./components/EducationLab";
import { MemoryInspector } from "./components/MemoryInspector";
import { RoadmapView } from "./components/RoadmapView";
import { AgentRunHistory, TaskItem, NoteItem, ToolDefinition, EducationalModule } from "./types";
import { AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"agent" | "education" | "memory" | "roadmap">("agent");
  const [history, setHistory] = useState<AgentRunHistory[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [modules, setModules] = useState<EducationalModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load initial state and educational modules
  useEffect(() => {
    async function loadData() {
      try {
        const stateRes = await fetch("/api/agent/state");
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setTasks(stateData.tasks || []);
          setNotes(stateData.notes || []);
          setTools(stateData.availableTools || []);
        }

        const eduRes = await fetch("/api/education/modules");
        if (eduRes.ok) {
          const eduData = await eduRes.json();
          setModules(eduData || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch initial agent data:", err);
      }
    }
    loadData();
  }, []);

  const handleRunGoal = async (goal: string) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute agent loop.");
      }

      const newRun: AgentRunHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        goal,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        finalResponse: data.finalResponse,
        steps: data.steps || [],
      };

      setHistory((prev) => [newRun, ...prev]);
      if (data.tasks) setTasks(data.tasks);
      if (data.notes) setNotes(data.notes);
    } catch (err: any) {
      console.error("Error executing goal:", err);
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      const res = await fetch("/api/agent/task/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch("/api/agent/task/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleClearMemory = async () => {
    try {
      const res = await fetch("/api/agent/clear-memory", { method: "POST" });
      if (res.ok) {
        setTasks([]);
        setNotes([]);
      }
    } catch (err) {
      console.error("Failed to clear memory:", err);
    }
  };

  const handleQuickRunPrompt = (prompt: string) => {
    setActiveTab("agent");
    handleRunGoal(prompt);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskCount={tasks.filter((t) => !t.completed).length}
        noteCount={notes.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-rose-600 hover:text-rose-900 font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "agent" && (
          <LiveAgentLab
            history={history}
            tasks={tasks}
            notes={notes}
            isLoading={isLoading}
            onRunGoal={handleRunGoal}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onClearMemory={handleClearMemory}
          />
        )}

        {activeTab === "education" && <EducationLab modules={modules} />}

        {activeTab === "memory" && (
          <MemoryInspector
            tasks={tasks}
            notes={notes}
            tools={tools}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onQuickRunPrompt={handleQuickRunPrompt}
          />
        )}

        {activeTab === "roadmap" && <RoadmapView />}
      </main>

      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <p>Project Agent • Incremental Agentic AI Learning Environment • Powered by Google Gemini 3.8 Flash</p>
      </footer>
    </div>
  );
}
