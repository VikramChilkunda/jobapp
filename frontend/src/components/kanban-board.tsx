"use client";

import {
  APPLICATION_STATUSES,
  type ApplicationListItem,
  type ApplicationStatus,
} from "@/types";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
  applications: ApplicationListItem[];
  onStatusChange: (appId: number, newStatus: ApplicationStatus) => void;
  onCardClick: (app: ApplicationListItem) => void;
}

export function KanbanBoard({
  applications,
  onStatusChange,
  onCardClick,
}: KanbanBoardProps) {
  const grouped = APPLICATION_STATUSES.reduce(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, ApplicationListItem[]>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          apps={grouped[status]}
          onDrop={onStatusChange}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
