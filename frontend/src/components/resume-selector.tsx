"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SavedResume } from "@/types";

interface ResumeSelectorProps {
  onResumeChange: (data: {
    resumeText?: string;
    savedResumeId?: number;
  }) => void;
}

export function ResumeSelector({ onResumeChange }: ResumeSelectorProps) {
  const [mode, setMode] = useState<"paste" | "saved">("paste");
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [saveNew, setSaveNew] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");

  useEffect(() => {
    api.getResumes().then((data) => {
      setResumes(data);
      const def = data.find((r) => r.isDefault);
      if (def) setSelectedId(def.id);
      else if (data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (mode === "paste") {
      onResumeChange({ resumeText: pastedText });
    } else if (selectedId) {
      onResumeChange({ savedResumeId: selectedId });
    }
  }, [mode, pastedText, selectedId, onResumeChange]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Your Resume
        </label>
        {resumes.length > 0 && (
          <div className="ml-auto flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`px-2 py-1 rounded ${mode === "paste" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Paste
            </button>
            <button
              type="button"
              onClick={() => setMode("saved")}
              className={`px-2 py-1 rounded ${mode === "saved" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Saved ({resumes.length})
            </button>
          </div>
        )}
      </div>

      {mode === "paste" ? (
        <>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume text here..."
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
            required={mode === "paste" && !selectedId}
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="save-resume"
              checked={saveNew}
              onChange={(e) => setSaveNew(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="save-resume" className="text-xs text-gray-500">
              Save this resume for later
            </label>
            {saveNew && (
              <input
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="Label (e.g. Full-Stack Resume)"
                className="ml-2 flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
              />
            )}
          </div>
        </>
      ) : (
        <select
          value={selectedId ?? ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} {r.isDefault ? "(default)" : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// Export for the analyze page to use
export function useSaveResumeIfNeeded() {
  return async (
    saveNew: boolean,
    saveLabel: string,
    resumeText: string
  ) => {
    if (saveNew && saveLabel && resumeText) {
      await api.createResume({ label: saveLabel, content: resumeText });
    }
  };
}
