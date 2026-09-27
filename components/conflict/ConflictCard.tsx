import React from "react";
import { ParcelConflict } from "@/types/conflict";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { GitCompare, ArrowRight, Layers, AlertCircle } from "lucide-react";
import Link from "next/link";

export const ConflictCard: React.FC<{ conflict: ParcelConflict }> = ({ conflict }) => {
  return (
    <Card variant="default" padding="md" hoverable className="flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <GitCompare className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-serif font-bold text-base text-ink">
                Parcel {conflict.parcelNumber}
              </h4>
              <span className="text-xs text-slate">{conflict.ward}</span>
            </div>
          </div>
          <Badge severity={conflict.severity} />
        </div>

        <div className="p-3 bg-fog rounded-2xl text-xs space-y-1.5 border border-mist">
          <div className="flex items-center justify-between text-slate">
            <span>Type:</span>
            <span className="font-semibold text-ink uppercase tracking-wider">{conflict.conflictType}</span>
          </div>
          <div className="flex items-center justify-between text-slate">
            <span>Max Boundary Dev:</span>
            <span className="font-semibold text-ink">
              {conflict.measurements.maxBoundaryDeviationM || 0} m
            </span>
          </div>
          <div className="flex items-center justify-between text-slate">
            <span>Area Difference:</span>
            <span className="font-semibold text-ink">
              {conflict.measurements.areaDifferenceSqM || 0} sq.m ({conflict.measurements.areaDifferencePercent || 0}%)
            </span>
          </div>
        </div>

        <div className="text-xs text-slate space-y-1">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sienna flex-shrink-0" />
            <span className="truncate">
              <strong>Source A:</strong> {conflict.sourceAName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Source B:</strong> {conflict.sourceBName}
            </span>
          </div>
        </div>
      </div>

      <Link href={`/review?conflictId=${conflict.conflictId}`}>
        <Button variant="accent" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
          Open Review Workspace
        </Button>
      </Link>
    </Card>
  );
};
