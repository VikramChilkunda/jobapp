import { STATUS_CONFIG, type ApplicationStatus } from "@/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
