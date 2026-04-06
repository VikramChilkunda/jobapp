"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "./status-badge";
import {
  APPLICATION_STATUSES,
  type ApplicationResponse,
  type ApplicationStatus,
} from "@/types";

interface ApplicationModalProps {
  appId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export function ApplicationModal({
  appId,
  onClose,
  onUpdate,
}: ApplicationModalProps) {
  const [app, setApp] = useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    api
      .getApplication(appId)
      .then((data) => {
        setApp(data);
        setNotes(data.notes || "");
        setJobUrl(data.jobUrl || "");
        setSalaryMin(data.salaryMin || "");
        setSalaryMax(data.salaryMax || "");
        setContactName(data.contactName || "");
        setContactEmail(data.contactEmail || "");
      })
      .finally(() => setLoading(false));
  }, [appId]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!app) return;
    await api.updateApplicationStatus(app.id, status);
    setApp({ ...app, status });
    onUpdate();
  };

  const handleSave = async () => {
    if (!app) return;
    setSaving(true);
    try {
      const updated = await api.updateApplication(app.id, {
        notes,
        jobUrl,
        salaryMin,
        salaryMax,
        contactName,
        contactEmail,
      });
      setApp(updated);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!app || !confirm("Delete this application? The analysis will be kept."))
      return;
    await api.deleteApplication(app.id);
    onUpdate();
    onClose();
  };

  const scoreColor =
    app?.fitScore !== null && app?.fitScore !== undefined
      ? app.fitScore >= 75
        ? "text-green-600"
        : app.fitScore >= 50
          ? "text-yellow-600"
          : "text-red-600"
      : "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : app ? (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {app.jobTitle || "Untitled Position"}
                </h2>
                <p className="text-sm text-gray-500">
                  {app.companyName || "Unknown Company"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            {/* Score + Status */}
            <div className="flex items-center gap-3">
              {app.fitScore !== null && (
                <span className={`text-2xl font-bold ${scoreColor}`}>
                  {app.fitScore}
                </span>
              )}
              <StatusBadge status={app.status} />
              <Link
                href={`/analyze/${app.analysisId}`}
                className="text-xs text-blue-600 hover:underline ml-auto"
              >
                View Full Analysis &rarr;
              </Link>
            </div>

            {/* Status selector */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <select
                value={app.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as ApplicationStatus)
                }
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "PhoneScreen" ? "Phone Screen" : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Job URL */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Job URL
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Salary Min
                </label>
                <input
                  type="text"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. $120k"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Salary Max
                </label>
                <input
                  type="text"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. $160k"
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Interview prep, follow-up reminders..."
                className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
