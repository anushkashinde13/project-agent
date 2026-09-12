import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Lightbulb,
  CheckCircle2,
  Terminal,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Layers,
  FileCode,
} from "lucide-react";
import { EducationalModule } from "../types";

interface EducationLabProps {
  modules: EducationalModule[];
}

export const EducationLab: React.FC<EducationLabProps> = ({ modules }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>("step1");
  const [copied, setCopied] = useState(false);

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

  const handleCopyCode = () => {
    if (!activeModule) return;
    navigator.clipboard.writeText(activeModule.pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Introduction */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-sm">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Incremental Engineering Curriculum</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Learning AI Agent Development from Scratch
        </h2>
        <p className="text-sm text-stone-300 mt-1 max-w-3xl leading-relaxed">
          Follow the progression from a raw LLM text query up to a reliable autonomous agent.
          Inspect the runnable Python code, understand the rationale behind each component, and learn how each module connects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 px-1 mb-2">
            Learning Milestones
          </p>
          <div className="space-y-1.5">
            {modules.map((mod, index) => {
              const isSelected = mod.id === selectedModuleId;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border text-xs cursor-pointer ${
                    isSelected
                      ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                      : "bg-white hover:bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-75">
                      {mod.stage}
                    </span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? "bg-amber-400 text-stone-900" : "bg-stone-100 text-stone-600"
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <p className="font-semibold text-sm mt-1 leading-snug">{mod.title}</p>
                  <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                    {mod.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Quick Python Setup Card */}
          <div className="mt-4 p-3.5 bg-stone-100 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
            <div className="flex items-center space-x-1.5 font-semibold text-stone-900">
              <Terminal className="w-3.5 h-3.5 text-stone-600" />
              <span>Python Files in Project</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              We generated ready-to-run Python files in the <code className="bg-white px-1 py-0.5 rounded border border-stone-300 text-stone-900 font-mono">/python_agent</code> directory.
            </p>
            <div className="space-y-1 font-mono text-[11px] text-stone-600">
              <div>• step1_basic_gemini.py</div>
              <div>• step2_function_calling.py</div>
              <div>• step3_tools_and_agent.py</div>
              <div>• step4_verification_agent.py</div>
            </div>
          </div>
        </div>

        {/* Detailed Content & Code Area */}
        {activeModule && (
          <div className="lg:col-span-3 space-y-6">
            {/* Module Overview Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {activeModule.stage}
                  </span>
                  <h3 className="text-xl font-bold text-stone-900 mt-1.5 tracking-tight">
                    {activeModule.title}
                  </h3>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied Python Code</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Python Script</span>
                    </>
                  )}
                </button>
              </div>

              {/* Purpose & Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Engineering Purpose & Explanation
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {activeModule.explanation}
                </p>
              </div>

              {/* Key Concept Pills */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Key Concepts Mastered in this Step
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModule.concepts.map((concept, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-stone-600" />
                    <span>Clean Python Implementation</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">google-genai SDK</span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
                  <div className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-800 text-xs text-stone-400 font-mono">
                    <span>{activeModule.id}.py</span>
                    <span>Python 3</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-stone-200 overflow-x-auto leading-relaxed max-h-96">
                    <code>{activeModule.pythonCode}</code>
                  </pre>
                </div>
              </div>

              {/* Architectural Insight */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
                <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Software Engineering Takeaway</span>
                  <span>
                    Notice the separation of concerns: the AI model acts as the <strong>reasoning engine</strong>, but your application server retains authoritative control over <strong>execution and data storage</strong>. This guarantees that math is 100% accurate, timestamps are real, and tasks persist safely.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
