"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ScoreGauge } from "@/components/score-gauge";
import { SkillTags } from "@/components/skill-tags";
import type { AnalysisResponse } from "@/types";

export default function AnalysisDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const id = Number(params.id);
    if (isNaN(id)) {
      setError("Invalid analysis ID");
      setLoading(false);
      return;
    }

    api
      .getAnalysis(id)
      .then(setAnalysis)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [authLoading, user, params.id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          &larr; Back to Dashboard
        </Link>
        <button
          onClick={() => api.downloadAnalysisPdf(Number(params.id))}
          className="text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {analysis.jobTitle || "Untitled Position"}
            </h1>
            <p className="text-gray-500">
              {analysis.companyName || "Unknown Company"} &middot;{" "}
              {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>
          {analysis.fitScore !== null && (
            <ScoreGauge score={analysis.fitScore} />
          )}
        </div>

        {analysis.summary && (
          <p className="mt-4 text-gray-700 leading-relaxed">
            {analysis.summary}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            Matching Skills
          </h2>
          <SkillTags skills={analysis.matchingSkills} variant="match" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Skill Gaps</h2>
          <SkillTags skills={analysis.missingSkills} variant="missing" />
        </div>
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Resume Suggestions
          </h2>
          <div className="space-y-4">
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {s.section}
                  </span>
                  <p className="text-gray-700 text-sm mt-0.5">{s.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
