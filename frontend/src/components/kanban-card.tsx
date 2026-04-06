"use client";

import type { ApplicationListItem } from "@/types";

interface KanbanCardProps {
  app: ApplicationListItem;
  onClick: () => void;
}

export function KanbanCard({ app, onClick }: KanbanCardProps) {
  const scoreColor =
    app.fitScore !== null
      ? app.fitScore >= 75
        ? "text-green-600"
        : app.fitScore >= 50
          ? "text-yellow-600"
          : "text-red-600"
      : "";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("applicationId", String(app.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {app.jobTitle || "Untitled Position"}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {app.companyName || "Unknown Company"}
          </p>
        </div>
        {app.fitScore !== null && (
          <span className={`text-lg font-bold shrink-0 ${scoreColor}`}>
            {app.fitScore}
          </span>
        )}
      </div>
      {app.appliedDate && (
        <p className="text-xs text-gray-400 mt-2">
          Applied {new Date(app.appliedDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
