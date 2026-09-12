import React, { useState } from "react";
import {
  Database,
  CheckSquare,
  FileText,
  Wrench,
  Search,
  Plus,
  Trash2,
  Check,
  Code2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { TaskItem, NoteItem, ToolDefinition } from "../types";

interface MemoryInspectorProps {
  tasks: TaskItem[];
  notes: NoteItem[];
  tools: ToolDefinition[];
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onQuickRunPrompt: (prompt: string) => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  tasks,
  notes,
  tools,
  onToggleTask,
  onDeleteTask,
  onQuickRunPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("calculator");

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Database className="w-4 h-4" />
          <span>Working Memory & Tool Registry</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Inspect Agent State & Tool Registry
        </h2>
        <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
          An AI agent requires persistent state (memory) and clearly typed capabilities (tools).
          Explore the live items stored in memory and inspect the exact tool schemas declared to Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-stone-800" />
              <h3 className="font-bold text-base text-stone-900">Task Memory Store</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
              {tasks.length} total
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            These tasks are saved in the agent's memory store. The agent can add, list, complete, or delete tasks when requested.
          </p>

          {tasks.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl">
              <p className="text-xs text-stone-400">No active tasks in store.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start justify-between p-3 rounded-xl border text-xs transition-colors ${
                    task.completed
                      ? "bg-stone-50 border-stone-200 opacity-60"
                      : "bg-white border-stone-200 shadow-2xs"
                  }`}
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="flex items-start space-x-2.5 text-left flex-1 cursor-pointer"
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
                      <span className="font-mono text-[11px] text-stone-400 mr-1.5">#{task.id}</span>
                      <span className={task.completed ? "line-through text-stone-400" : "font-semibold text-stone-800"}>
                        {task.title}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-semibold ${
                            task.priority === "high"
                              ? "bg-rose-100 text-rose-700"
                              : task.priority === "low"
                              ? "bg-stone-100 text-stone-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-stone-800" />
              <h3 className="font-bold text-base text-stone-900">Notes & Knowledge Store</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
              {notes.length} total
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes by keyword or tag..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl">
              <p className="text-xs text-stone-400">
                {searchTerm ? "No notes matching your search query." : "No saved notes in memory."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center space-x-1.5">
                      <span className="font-mono text-stone-400 font-normal">#{note.id}</span>
                      <span>{note.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-200 text-stone-700 font-medium flex items-center space-x-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{note.category}</span>
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{note.content}</p>
                  <span className="text-[10px] text-stone-400 font-mono block">
                    Saved: {new Date(note.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tool Registry Explorer */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
          <Wrench className="w-5 h-5 text-stone-800" />
          <div>
            <h3 className="font-bold text-base text-stone-900">Registered Tool Schemas</h3>
            <p className="text-xs text-stone-500">
              The tools exposed to Gemini 3.8 Flash via function declarations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const isSelected = selectedTool === tool.name;
            return (
              <button
                key={tool.name}
                onClick={() => setSelectedTool(tool.name)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">{tool.name}()</span>
                </div>
                <p className={`text-xs mt-1 font-medium ${isSelected ? "text-stone-200" : "text-stone-600"}`}>
                  {tool.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Tool Details & Quick Prompt Trigger */}
        {tools.find((t) => t.name === selectedTool) && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            {(() => {
              const tool = tools.find((t) => t.name === selectedTool)!;
              return (
                <>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{tool.label}</h4>
                    <p className="text-xs text-stone-600 mt-0.5">{tool.description}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Sample Agent Goals for this Tool:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tool.examples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => onQuickRunPrompt(example)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-xs text-stone-700 transition-colors flex items-center space-x-1"
                        >
                          <span>"{example}"</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
