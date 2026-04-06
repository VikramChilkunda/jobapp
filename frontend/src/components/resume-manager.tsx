"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SavedResume } from "@/types";

export function ResumeManager() {
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadResumes = () => {
    api
      .getResumes()
      .then(setResumes)
      .finally(() => setLoading(false));
  };

  useEffect(loadResumes, []);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setLabel("");
    setContent("");
    setIsDefault(false);
  };

  const handleEdit = async (id: number) => {
    const resume = await api.getResume(id);
    setEditId(id);
    setLabel(resume.label);
    setContent(resume.content);
    setIsDefault(resume.isDefault);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.updateResume(editId, { label, content, isDefault });
      } else {
        await api.createResume({ label, content, isDefault });
      }
      resetForm();
      loadResumes();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this saved resume?")) return;
    await api.deleteResume(id);
    loadResumes();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Resumes</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Add Resume
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-gray-200 p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Full-Stack Resume"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resume Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your resume text..."
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="is-default" className="text-sm text-gray-600">
              Set as default resume
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {resumes.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No saved resumes yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-gray-900 underline font-medium"
          >
            Add your first resume
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{r.label}</span>
                  {r.isDefault && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Updated {new Date(r.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(r.id)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
