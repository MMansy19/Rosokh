import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorClass: string;
  "aria-label"?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(
  ({ icon: Icon, value, label, colorClass, "aria-label": ariaLabel }) => {
    return (
      <div
        className="bg-background/50 rounded-xl p-4 border border-border/30"
        role="region"
        aria-label={ariaLabel || `${label}: ${value}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-8 h-8 ${colorClass} rounded-lg flex items-center justify-center`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-xl font-semibold text-foreground">{value}</div>
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    );
  },
);

StatCard.displayName = "StatCard";
