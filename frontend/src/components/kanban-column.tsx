"use client";

import { useState } from "react";
import { STATUS_CONFIG, type ApplicationStatus, type ApplicationListItem } from "@/types";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  status: ApplicationStatus;
  apps: ApplicationListItem[];
  onDrop: (appId: number, status: ApplicationStatus) => void;
  onCardClick: (app: ApplicationListItem) => void;
}

export function KanbanColumn({ status, apps, onDrop, onCardClick }: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`flex flex-col w-64 shrink-0 rounded-lg ${
        dragOver ? "bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-300" : "bg-gray-100 dark:bg-gray-900"
      } transition-colors`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const id = Number(e.dataTransfer.getData("applicationId"));
        if (!isNaN(id)) onDrop(id, status);
      }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400 bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5">
            {apps.length}
          </span>
        </div>
      </div>

      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            onClick={() => onCardClick(app)}
          />
        ))}
      </div>
    </div>
  );
}
