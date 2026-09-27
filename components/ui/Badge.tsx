import React from "react";
import { clsx } from "clsx";
import { CheckCircle2, AlertTriangle, Clock, Info } from "lucide-react";

interface BadgeProps {
  status?: "approved" | "pending" | "pending_review" | "conflict" | "info";
  severity?: "low" | "medium" | "high";
  label?: string;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  severity,
  label,
  icon = true,
  className,
}) => {
  let badgeStyle = "bg-fog text-slate border-mist";
  let IconComponent: React.ElementType | null = null;
  let text = label;

  if (status === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    IconComponent = CheckCircle2;
    text = label || "Approved";
  } else if (status === "pending" || status === "pending_review") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200/60";
    IconComponent = Clock;
    text = label || "Pending Review";
  } else if (status === "conflict") {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200/60";
    IconComponent = AlertTriangle;
    text = label || "Conflict Flagged";
  } else if (status === "info") {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200/60";
    IconComponent = Info;
    text = label || "Info";
  }

  if (severity === "low") {
    badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
    text = label || "Low Severity";
  } else if (severity === "medium") {
    badgeStyle = "bg-amber-100 text-amber-800 border-amber-300";
    text = label || "Medium Severity";
  } else if (severity === "high") {
    badgeStyle = "bg-red-100 text-red-800 border-red-300 font-semibold";
    text = label || "High Severity";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs border font-medium",
        badgeStyle,
        className
      )}
    >
      {icon && IconComponent && <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
