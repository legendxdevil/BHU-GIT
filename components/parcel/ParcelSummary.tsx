import React from "react";
import { ParcelRecord } from "@/types/parcel";
import { Card } from "../ui/Card";
import { User, Tag, Maximize2, FileText, Building2 } from "lucide-react";

export const ParcelSummary: React.FC<{ parcel: ParcelRecord }> = ({ parcel }) => {
  const { attributes } = parcel;

  return (
    <Card variant="default" padding="md" className="space-y-4">
      <h3 className="font-serif text-lg font-bold text-ink border-b border-mist pb-3">
        Attribute Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-start gap-3 p-3 bg-fog rounded-2xl">
          <User className="w-4 h-4 text-sienna mt-0.5" />
          <div>
            <span className="text-slate font-medium block">Registered Owner</span>
            <span className="text-ink font-semibold text-sm">{attributes.ownerName || "Unrecorded"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-fog rounded-2xl">
          <Tag className="w-4 h-4 text-sienna mt-0.5" />
          <div>
            <span className="text-slate font-medium block">Land Use Classification</span>
            <span className="text-ink font-semibold text-sm">{attributes.landUse || "Unspecified"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-fog rounded-2xl">
          <Maximize2 className="w-4 h-4 text-sienna mt-0.5" />
          <div>
            <span className="text-slate font-medium block">Deed vs. Calculated Area</span>
            <span className="text-ink font-semibold text-sm">
              {attributes.deedAreaSqM || 0} sq.m / {attributes.calculatedAreaSqM || 0} sq.m
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-fog rounded-2xl">
          <Building2 className="w-4 h-4 text-sienna mt-0.5" />
          <div>
            <span className="text-slate font-medium block">Survey Number</span>
            <span className="text-ink font-semibold text-sm">{attributes.surveyNumber}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
