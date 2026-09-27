import React from "react";
import { ParcelConflict } from "@/types/conflict";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ArrowRight, Eye } from "lucide-react";
import Link from "next/link";

interface ConflictTableProps {
  conflicts: ParcelConflict[];
}

export const ConflictTable: React.FC<ConflictTableProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="p-12 text-center bg-fog rounded-card border border-mist space-y-2">
        <h4 className="font-serif font-bold text-lg text-ink">No Active Conflicts</h4>
        <p className="text-sm text-slate">All indexed spatial and attribute records are currently in agreement.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-paper border border-mist rounded-card shadow-card">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-fog border-b border-mist text-slate font-semibold uppercase tracking-wider">
            <th className="p-4">Conflict ID</th>
            <th className="p-4">Parcel No</th>
            <th className="p-4">Ward</th>
            <th className="p-4">Conflict Type</th>
            <th className="p-4">Severity</th>
            <th className="p-4">Deviation / Area Δ</th>
            <th className="p-4">Assigned Officer</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mist">
          {conflicts.map((c) => (
            <tr key={c.conflictId} className="hover:bg-fog/60 transition-colors">
              <td className="p-4 font-mono font-semibold text-ink">{c.conflictId}</td>
              <td className="p-4 font-serif font-bold text-sm text-ink">{c.parcelNumber}</td>
              <td className="p-4 text-slate">{c.ward}</td>
              <td className="p-4">
                <span className="bg-fog px-2.5 py-1 rounded-pill border border-mist font-semibold text-ink uppercase">
                  {c.conflictType}
                </span>
              </td>
              <td className="p-4">
                <Badge severity={c.severity} />
              </td>
              <td className="p-4 text-slate">
                <div className="font-semibold text-ink">
                  {c.measurements.maxBoundaryDeviationM ? `${c.measurements.maxBoundaryDeviationM}m dev` : "Attribute discrepancy"}
                </div>
                <div className="text-[11px] text-ash">
                  {c.measurements.areaDifferenceSqM ? `${c.measurements.areaDifferenceSqM} sq.m (${c.measurements.areaDifferencePercent}%)` : "No area change"}
                </div>
              </td>
              <td className="p-4 text-slate font-medium">{c.assignedTo || "Unassigned"}</td>
              <td className="p-4 text-right">
                <Link href={`/review?conflictId=${c.conflictId}`}>
                  <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Review
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
