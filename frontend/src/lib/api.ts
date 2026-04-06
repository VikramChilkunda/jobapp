import type {
  AuthResponse,
  AnalysisResponse,
  AnalysisListItem,
  CreateAnalysisRequest,
  ApplicationResponse,
  ApplicationListItem,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationStatus,
  SavedResume,
  SavedResumeDetail,
  CreateResumeRequest,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  // Auth
  register(email: string, password: string, name: string) {
    return fetchApi<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  login(email: string, password: string) {
    return fetchApi<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Analysis
  createAnalysis(data: CreateAnalysisRequest) {
    return fetchApi<AnalysisResponse>("/api/analysis", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAnalyses() {
    return fetchApi<AnalysisListItem[]>("/api/analysis");
  },

  getAnalysis(id: number) {
    return fetchApi<AnalysisResponse>(`/api/analysis/${id}`);
  },

  async downloadAnalysisPdf(id: number) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/analysis/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Applications
  getApplications() {
    return fetchApi<ApplicationListItem[]>("/api/application");
  },

  getApplication(id: number) {
    return fetchApi<ApplicationResponse>(`/api/application/${id}`);
  },

  createApplication(data: CreateApplicationRequest) {
    return fetchApi<ApplicationResponse>("/api/application", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateApplication(id: number, data: UpdateApplicationRequest) {
    return fetchApi<ApplicationResponse>(`/api/application/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updateApplicationStatus(id: number, status: ApplicationStatus) {
    return fetchApi<ApplicationResponse>(`/api/application/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  deleteApplication(id: number) {
    return fetchApi<void>(`/api/application/${id}`, {
      method: "DELETE",
    });
  },

  // Resumes
  getResumes() {
    return fetchApi<SavedResume[]>("/api/resume");
  },

  getResume(id: number) {
    return fetchApi<SavedResumeDetail>(`/api/resume/${id}`);
  },

  createResume(data: CreateResumeRequest) {
    return fetchApi<SavedResumeDetail>("/api/resume", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateResume(
    id: number,
    data: { label?: string; content?: string; isDefault?: boolean }
  ) {
    return fetchApi<SavedResumeDetail>(`/api/resume/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteResume(id: number) {
    return fetchApi<void>(`/api/resume/${id}`, {
      method: "DELETE",
    });
  },
};
