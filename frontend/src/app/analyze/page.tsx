"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ResumeSelector } from "@/components/resume-selector";

export default function AnalyzePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resumeData = useRef<{
    resumeText?: string;
    savedResumeId?: number;
  }>({});

  const handleResumeChange = useCallback(
    (data: { resumeText?: string; savedResumeId?: number }) => {
      resumeData.current = data;
    },
    []
  );

  if (isLoading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { resumeText, savedResumeId } = resumeData.current;
    if (!resumeText && !savedResumeId) {
      setError("Please provide a resume (paste or select a saved one)");
      return;
    }

    setLoading(true);
    try {
      // Create analysis
      const result = await api.createAnalysis({
        jobDescription,
        resumeText: resumeText || undefined,
        savedResumeId: savedResumeId || undefined,
        jobTitle: jobTitle || undefined,
        companyName: companyName || undefined,
      });

      // Auto-create application in pipeline
      await api.createApplication({ analysisId: result.id }).catch(() => {});

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Analysis</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title (optional)
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company (optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-y"
            required
          />
        </div>

        <ResumeSelector onResumeChange={handleResumeChange} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Analyzing with AI...
            </span>
          ) : (
            "Analyze Fit"
          )}
        </button>
      </form>
    </div>
  );
}
