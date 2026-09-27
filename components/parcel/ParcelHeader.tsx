import React from "react";
import { ParcelRecord } from "@/types/parcel";
import { Badge } from "../ui/Badge";
import { MapPin, Calendar, FileCode2 } from "lucide-react";

export const ParcelHeader: React.FC<{ parcel: ParcelRecord }> = ({ parcel }) => {
  return (
    <div className="bg-paper border border-mist rounded-card p-6 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blush text-sienna font-serif font-bold text-lg flex items-center justify-center shadow-sm">
            {parcel.parcelNumber}
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Parcel {parcel.parcelNumber}</h2>
            <p className="text-xs text-slate font-medium flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sienna" /> {parcel.ward} ({parcel.zone || "Zone A"})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileCode2 className="w-3.5 h-3.5 text-slate" /> ID: {parcel.parcelId}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge status={parcel.status} />
          <div className="text-xs text-slate bg-fog px-3 py-1.5 rounded-pill border border-mist flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-ash" />
            <span>Active Version: {parcel.currentVersionId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
