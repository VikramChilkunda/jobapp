export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}

export interface User {
  name: string;
  email: string;
}

export interface SuggestionItem {
  section: string;
  suggestion: string;
}

export interface AnalysisResponse {
  id: number;
  jobTitle: string | null;
  companyName: string | null;
  fitScore: number | null;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: SuggestionItem[];
  summary: string | null;
  createdAt: string;
}

export interface AnalysisListItem {
  id: number;
  jobTitle: string | null;
  companyName: string | null;
  fitScore: number | null;
  createdAt: string;
}

export interface CreateAnalysisRequest {
  jobDescription: string;
  resumeText?: string;
  savedResumeId?: number;
  jobTitle?: string;
  companyName?: string;
}

// Application pipeline types
export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "PhoneScreen"
  | "Interview"
  | "Offer"
  | "Rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "PhoneScreen",
  "Interview",
  "Offer",
  "Rejected",
];

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  Wishlist: { label: "Wishlist", color: "text-gray-700", bg: "bg-gray-100" },
  Applied: { label: "Applied", color: "text-blue-700", bg: "bg-blue-100" },
  PhoneScreen: {
    label: "Phone Screen",
    color: "text-purple-700",
    bg: "bg-purple-100",
  },
  Interview: {
    label: "Interview",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  Offer: { label: "Offer", color: "text-green-700", bg: "bg-green-100" },
  Rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

export interface ApplicationResponse {
  id: number;
  analysisId: number;
  jobTitle: string | null;
  companyName: string | null;
  fitScore: number | null;
  status: ApplicationStatus;
  appliedDate: string | null;
  notes: string | null;
  jobUrl: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationListItem {
  id: number;
  analysisId: number;
  jobTitle: string | null;
  companyName: string | null;
  fitScore: number | null;
  status: ApplicationStatus;
  appliedDate: string | null;
  createdAt: string;
}

export interface CreateApplicationRequest {
  analysisId: number;
  status?: ApplicationStatus;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
  jobUrl?: string;
  salaryMin?: string;
  salaryMax?: string;
  contactName?: string;
  contactEmail?: string;
}

// Saved resume types
export interface SavedResume {
  id: number;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedResumeDetail extends SavedResume {
  content: string;
}

export interface CreateResumeRequest {
  label: string;
  content: string;
  isDefault?: boolean;
}
