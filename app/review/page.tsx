"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParcelMap } from "@/components/map/ParcelMap";
import { MapLegend } from "@/components/map/MapLegend";
import { EvidencePanel } from "@/components/review/EvidencePanel";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { useToast } from "@/components/ui/Toast";
import { getConflictById, getParcelById } from "@/lib/firebase/firestore";
import { acquireReviewLock, releaseReviewLock } from "@/lib/firebase/realtime";
import { ParcelConflict } from "@/types/conflict";
import { ParcelRecord } from "@/types/parcel";
import { DecisionAction } from "@/lib/constants";
import { GitCompare, ShieldAlert, UserCheck, Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ReviewContent() {
  const searchParams = useSearchParams();
  const conflictId = searchParams.get("conflictId") || "C-884";
  const router = useRouter();
  const { toast } = useToast();

  const [conflict, setConflict] = useState<ParcelConflict | null>(null);
  const [parcel, setParcel] = useState<ParcelRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockReviewer, setLockReviewer] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const c = await getConflictById(conflictId);
      if (c) {
        setConflict(c);
        const p = await getParcelById(c.parcelId);
        setParcel(p);

        // Attempt acquiring Realtime Presence Lock
        const lockRes = await acquireReviewLock({
          parcelId: c.parcelId,
          conflictId: c.conflictId,
          reviewerId: "user_officer_81",
          reviewerName: "Review Officer A",
        });

        if (!lockRes.acquired) {
          setIsLockedByOther(true);
          setLockReviewer(lockRes.currentSession.activeReviewerName || "another officer");
          toast(
            "warning",
            "Review Lock Active",
            `This parcel is currently locked by ${lockRes.currentSession.activeReviewerName}`
          );
        }
      }
    }
    load();

    return () => {
      if (conflict) {
        releaseReviewLock(conflict.parcelId);
      }
    };
  }, [conflictId]);

  const handleDecisionSubmit = async (action: DecisionAction, reason: string) => {
    if (!conflict || !parcel) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/conflicts/${conflict.conflictId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason,
          reviewerId: "user_officer_81",
          reviewerName: "Review Officer A",
        }),
      });

      const json = await res.json();
      setIsSubmitting(false);

      if (json.success) {
        toast(
          "success",
          "Decision Committed & Version Created",
          `Decision [${action.toUpperCase()}] executed. Committed Version ${json.data.newVersionId || "V3"}.`
        );
        router.push(`/parcels/${parcel.parcelId}`);
      } else {
        toast("error", "Commit Failed", json.error?.message || "Unable to commit decision.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      toast("error", "Server Error", err.message || "Failed to commit decision.");
    }
  };

  if (!conflict || !parcel) {
    return <div className="p-12 text-center text-slate">Loading review workspace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Review Banner */}
      {isLockedByOther && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Active Review Lock:</span> This parcel review session is currently active under {lockReviewer}. Concurrent approvals are restricted.
          </div>
        </div>
      )}

      {/* 3-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center/Left Main Interactive Map Comparison Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card variant="default" padding="none" className="h-[560px] relative overflow-hidden">
            <ParcelMap
              parcels={[parcel]}
              selectedParcelId={parcel.parcelId}
              incomingGeometry={conflict.incomingGeometry}
              proposedGeometry={conflict.proposal.proposedGeometry}
            />
            <MapLegend className="absolute bottom-4 left-4 z-10 max-w-xs" />
          </Card>

          {/* Measurements Breakdown Bar */}
          <Card variant="default" padding="sm" className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate">
            <div>
              <span className="text-[10px] text-ash uppercase font-semibold block">Max Deviation</span>
              <span className="font-serif font-bold text-base text-ink">{conflict.measurements.maxBoundaryDeviationM || 0} m</span>
            </div>
            <div>
              <span className="text-[10px] text-ash uppercase font-semibold block">Area Difference</span>
              <span className="font-serif font-bold text-base text-ink">{conflict.measurements.areaDifferenceSqM || 0} sq.m</span>
            </div>
            <div>
              <span className="text-[10px] text-ash uppercase font-semibold block">Shape Overlap</span>
              <span className="font-serif font-bold text-base text-ink">{Math.round((conflict.measurements.shapeOverlapRatio || 1) * 100)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-ash uppercase font-semibold block">Conflict Type</span>
              <span className="font-serif font-bold text-base text-sienna uppercase">{conflict.conflictType}</span>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Evidence Explanation & Decision Workspace */}
        <div className="space-y-6">
          <EvidencePanel proposal={conflict.proposal} conflict={conflict} />
          <ReviewPanel
            conflict={conflict}
            onDecision={handleDecisionSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <div className="flex min-h-screen bg-fog">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <PageContainer
          title="Human-in-the-Loop Review Workspace"
          description="Inspect multi-source spatial evidence, explainable harmonization proposals, and commit version updates."
        >
          <Suspense fallback={<div className="p-12 text-center text-slate">Loading workspace...</div>}>
            <ReviewContent />
          </Suspense>
        </PageContainer>
      </div>
    </div>
  );
}
