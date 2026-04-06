"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ResumeManager } from "@/components/resume-manager";

export default function ResumesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ResumeManager />
    </div>
  );
}
