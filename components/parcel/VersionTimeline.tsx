"use client";

import React from "react";
import { ParcelVersion } from "@/types/version";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { History, UserCheck, CheckCircle2, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";

interface VersionTimelineProps {
  versions: ParcelVersion[];
  selectedVersionId?: string | null;
  onSelectVersion?: (version: ParcelVersion) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  selectedVersionId,
  onSelectVersion,
}) => {
  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex items-center justify-between border-b border-mist pb-3">
        <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
          <History className="w-5 h-5 text-sienna" />
          Version History & Time-Travel
        </h3>
        <span className="text-xs text-slate font-medium">{versions.length} Total Versions</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-mist-dark">
        {versions.map((ver) => {
          const isSelected = ver.versionId === selectedVersionId;
          const isImported = ver.decision === "imported";

          return (
            <div
              key={ver.versionId}
              onClick={() => onSelectVersion && onSelectVersion(ver)}
              className={clsx(
                "relative group cursor-pointer p-4 rounded-2xl border transition-all duration-200",
                isSelected
                  ? "bg-blush-light border-sienna shadow-md ring-2 ring-sienna/20"
                  : "bg-fog border-mist hover:border-slate/40 hover:bg-paper"
              )}
            >
              {/* Timeline Bullet Node */}
              <div
                className={clsx(
                  "absolute -left-[31px] top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-sienna border-paper text-paper shadow-sm"
                    : isImported
                    ? "bg-ash border-paper text-paper"
                    : "bg-emerald-600 border-paper text-paper"
                )}
              >
                {isImported ? <History className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
              </div>

              {/* Version Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-ink">
                      Version {ver.versionId}
                    </span>
                    <Badge
                      status={isImported ? "info" : "approved"}
                      label={isImported ? "Base Record" : `Decision: ${ver.decision}`}
                      icon={false}
                      className="text-[10px]"
                    />
                    <span className="text-xs text-slate font-medium">
                      Confidence: {Math.round(ver.confidenceScore * 100)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate mt-1 line-clamp-2">{ver.reason}</p>
                </div>

                <div className="text-right flex-shrink-0 text-xs text-slate">
                  <div className="flex items-center gap-1 sm:justify-end text-ink font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-sienna" />
                    <span>{ver.reviewerName}</span>
                  </div>
                  <span className="text-[11px] text-ash">
                    {new Date(ver.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Changes Pill Breakdown */}
              {ver.changesSummary && (
                <div className="mt-3 pt-2 border-t border-mist/60 flex items-center gap-3 text-[11px] text-slate font-medium">
                  {ver.changesSummary.areaDeltaSqM !== undefined && (
                    <span className="bg-paper px-2 py-0.5 rounded-pill border border-mist">
                      Area Δ: {ver.changesSummary.areaDeltaSqM > 0 ? "+" : ""}
                      {ver.changesSummary.areaDeltaSqM} sq.m
                    </span>
                  )}
                  {ver.changesSummary.maxBoundaryDeviationM !== undefined && (
                    <span className="bg-paper px-2 py-0.5 rounded-pill border border-mist">
                      Boundary Dev: {ver.changesSummary.maxBoundaryDeviationM}m
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
