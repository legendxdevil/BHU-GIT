import React from "react";
import { Card } from "../ui/Card";
import { ShieldCheck, AlertTriangle, Clock, Layers, Ruler, MapPin } from "lucide-react";

export const MapLegend: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card variant="subtle" padding="sm" className={`text-xs space-y-2.5 select-none shadow-md border border-mist ${className}`}>
      <div className="flex items-center justify-between border-b border-mist pb-1.5">
        <span className="font-serif font-bold text-ink text-xs flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sienna" />
          Map Legend & Symbol Guide
        </span>
        <span className="text-[10px] text-slate font-medium">Bhu-Git Cadastral Engine</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
        {/* Approved Green */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500/30 border-2 border-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold text-ink block leading-tight">Approved Parcel</span>
            <span className="text-[9px] text-slate">Verified Title (Green)</span>
          </div>
        </div>

        {/* Conflict Red */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-3.5 h-3.5 rounded bg-rose-500/40 border-2 border-rose-600 shrink-0 animate-pulse" />
          <div>
            <span className="font-semibold text-rose-700 block leading-tight">Conflict Zone</span>
            <span className="text-[9px] text-slate">Boundary Overlap (Red)</span>
          </div>
        </div>

        {/* Pending Amber */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-3.5 h-3.5 rounded bg-amber-500/30 border-2 border-amber-600 shrink-0" />
          <div>
            <span className="font-semibold text-amber-800 block leading-tight">Pending Review</span>
            <span className="text-[9px] text-slate">Awaiting Officer (Amber)</span>
          </div>
        </div>

        {/* Incoming Survey */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-4 h-0 border-t-2 border-dashed border-blue-600 shrink-0" />
          <div>
            <span className="font-semibold text-blue-800 block leading-tight">Incoming Survey</span>
            <span className="text-[9px] text-slate">GNSS / Drone Layer</span>
          </div>
        </div>

        {/* Harmonized Version */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-4 h-0 border-t-2 border-sienna shrink-0" />
          <div>
            <span className="font-semibold text-sienna block leading-tight">Harmonized Ledger</span>
            <span className="text-[9px] text-slate">Master Cadastral Boundary</span>
          </div>
        </div>

        {/* Survey Pins */}
        <div className="flex items-center gap-2 p-1.5 bg-paper rounded-lg border border-mist">
          <span className="w-2.5 h-2.5 rounded-full bg-sienna border border-paper shrink-0" />
          <div>
            <span className="font-semibold text-ink block leading-tight">GNSS Pin</span>
            <span className="text-[9px] text-slate">Ground Survey Control</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
