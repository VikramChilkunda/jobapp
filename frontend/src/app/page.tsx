"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { KanbanBoard } from "@/components/kanban-board";
import { ApplicationModal } from "@/components/application-modal";
import { PipelineStats } from "@/components/pipeline-stats";
import type { ApplicationListItem, ApplicationStatus } from "@/types";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  const loadApplications = () => {
    if (!user) return;
    setLoadingApps(true);
    api
      .getApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoadingApps(false));
  };

  useEffect(loadApplications, [user]);

  const handleStatusChange = async (
    appId: number,
    newStatus: ApplicationStatus
  ) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );

    try {
      await api.updateApplicationStatus(appId, newStatus);
    } catch {
      // Revert on error
      loadApplications();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Resume Analyzer
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Paste a job description and your resume. Get an instant fit score,
          skill gap analysis, and actionable suggestions to improve your
          application.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Application Pipeline
        </h1>
        <Link
          href="/analyze"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          New Analysis
        </Link>
      </div>

      {loadingApps ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">
            No applications in your pipeline yet
          </p>
          <Link
            href="/analyze"
            className="text-gray-900 underline font-medium"
          >
            Run your first analysis to get started
          </Link>
        </div>
      ) : (
        <>
        <PipelineStats apps={applications} />
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onCardClick={(app) => setSelectedAppId(app.id)}
        />
        </>
      )}

      {selectedAppId && (
        <ApplicationModal
          appId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onUpdate={loadApplications}
        />
      )}
    </div>
  );
}
