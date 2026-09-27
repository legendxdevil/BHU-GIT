import React from "react";
import { HarmonizationProposal, ParcelConflict } from "@/types/conflict";
import { Card } from "../ui/Card";
import { Sparkles, CheckCircle2, ShieldCheck, Info } from "lucide-react";

interface EvidencePanelProps {
  proposal: HarmonizationProposal;
  conflict: ParcelConflict;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ proposal, conflict }) => {
  return (
    <Card variant="default" padding="md" className="space-y-4">
      <div className="flex items-center justify-between border-b border-mist pb-3">
        <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sienna" />
          Harmonization Proposal & Explanation
        </h3>
        <div className="flex items-center gap-1.5 bg-blush px-3 py-1 rounded-pill text-sienna font-semibold text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Evidence Score: {Math.round(proposal.confidenceScore * 100)}%</span>
        </div>
      </div>

      {/* AI Explanation Reasons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate">
          Evidence Rationale
        </span>
        <div className="space-y-2">
          {proposal.explanationReasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 bg-fog rounded-2xl text-xs text-slate border border-mist">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-ink leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discrepancy Breakdown */}
      {conflict.measurements.discrepantAttributes && conflict.measurements.discrepantAttributes.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-mist">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">
            Attribute Discrepancies
          </span>
          <div className="space-y-2">
            {conflict.measurements.discrepantAttributes.map((attr, idx) => (
              <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs space-y-1">
                <div className="font-semibold text-amber-900 uppercase tracking-wider text-[10px]">
                  Field: {attr.field}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate">
                  <div>
                    <span className="text-[10px] text-ash block">Current Value:</span>
                    <span className="font-semibold text-ink">{String(attr.valueA)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ash block">Incoming Claim:</span>
                    <span className="font-semibold text-sienna">{String(attr.valueB)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
