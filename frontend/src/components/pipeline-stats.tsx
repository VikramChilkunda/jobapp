"use client";

import {
  APPLICATION_STATUSES,
  STATUS_CONFIG,
  type ApplicationListItem,
} from "@/types";

export function PipelineStats({ apps }: { apps: ApplicationListItem[] }) {
  const total = apps.length;
  const avgScore =
    apps.filter((a) => a.fitScore !== null).length > 0
      ? Math.round(
          apps
            .filter((a) => a.fitScore !== null)
            .reduce((sum, a) => sum + a.fitScore!, 0) /
            apps.filter((a) => a.fitScore !== null).length
        )
      : null;

  const statusCounts = APPLICATION_STATUSES.map((s) => ({
    status: s,
    count: apps.filter((a) => a.status === s).length,
    ...STATUS_CONFIG[s],
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {total}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {avgScore ?? "—"}
        </p>
      </div>
      {statusCounts.map((s) => (
        <div
          key={s.status}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
        >
          <p className={`text-xs ${s.color}`}>{s.label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {s.count}
          </p>
        </div>
      ))}
    </div>
  );
}
