import { NextRequest, NextResponse } from "next/server";
import { getConflictById, updateConflictStatus, getParcelById, createVersion, addAuditLog } from "@/lib/firebase/firestore";
import { ParcelVersion } from "@/types/version";

export async function POST(
  req: NextRequest,
  { params }: { params: { conflictId: string } }
) {
  try {
    const conflictId = params.conflictId;
    const body = await req.json();
    const { action, reason, reviewerId = "user_officer_81", reviewerName = "Review Officer A" } = body;

    if (!action || !reason) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Action and justification note required." } },
        { status: 400 }
      );
    }

    const conflict = await getConflictById(conflictId);
    if (!conflict) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Conflict record not found." } },
        { status: 404 }
      );
    }

    const parcel = await getParcelById(conflict.parcelId);
    if (!parcel) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Target parcel record not found." } },
        { status: 404 }
      );
    }

    let newVersionId = parcel.currentVersionId;

    if (action === "approve" || action === "modify") {
      // 1. Generate Next Version ID
      const verNum = parseInt(parcel.currentVersionId.split("-").pop() || "2") + 1;
      newVersionId = `V-${parcel.parcelId.replace("P-", "")}-${verNum}`;

      const committedGeometry = action === "modify" && body.modifiedGeometry ? body.modifiedGeometry : conflict.proposal.proposedGeometry;
      const committedAttributes = action === "modify" && body.modifiedAttributes ? body.modifiedAttributes : conflict.proposal.proposedAttributes;

      const newVersion: ParcelVersion = {
        versionId: newVersionId,
        parcelId: parcel.parcelId,
        parentVersionId: parcel.currentVersionId,
        versionNumber: verNum,
        geometry: committedGeometry,
        attributes: committedAttributes,
        sourceIds: [conflict.sourceAId, conflict.sourceBId],
        evidenceSummary: [
          {
            sourceId: conflict.sourceBId,
            sourceType: "GNSS_SURVEY",
            datasetName: conflict.sourceBName,
            weight: 0.94,
            description: "Reviewed and approved spatial boundary evidence",
            captureDate: new Date().toISOString().split("T")[0],
          },
        ],
        confidenceScore: conflict.proposal.confidenceScore,
        decision: action,
        reviewerId,
        reviewerName,
        reason,
        changesSummary: {
          areaDeltaSqM: conflict.measurements.areaDifferenceSqM,
          maxBoundaryDeviationM: conflict.measurements.maxBoundaryDeviationM,
        },
        createdAt: Date.now(),
      };

      await createVersion(newVersion);
      await updateConflictStatus(conflictId, "resolved");

      await addAuditLog({
        parcelId: parcel.parcelId,
        action: "APPROVED",
        actorId: reviewerId,
        actorName: reviewerName,
        actorRole: "review_officer",
        fromVersion: parcel.currentVersionId,
        toVersion: newVersionId,
        reason,
      });
    } else if (action === "reject") {
      await updateConflictStatus(conflictId, "rejected");

      await addAuditLog({
        parcelId: parcel.parcelId,
        action: "REJECTED",
        actorId: reviewerId,
        actorName: reviewerName,
        actorRole: "review_officer",
        reason,
      });
    } else if (action === "field_check") {
      await addAuditLog({
        parcelId: parcel.parcelId,
        action: "FIELD_CHECK_REQUESTED",
        actorId: reviewerId,
        actorName: reviewerName,
        actorRole: "review_officer",
        reason,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        conflictId,
        action,
        newVersionId,
      },
    });
  } catch (err: any) {
    console.error("Error resolving conflict:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to resolve conflict." } },
      { status: 500 }
    );
  }
}
