import { NextRequest, NextResponse } from "next/server";
import { getParcelById, createVersion, addAuditLog } from "@/lib/firebase/firestore";
import { ParcelVersion } from "@/types/version";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parcelId,
      expectedParentVersionId,
      geometry,
      attributes,
      reason,
      reviewerId = "user_officer_81",
      reviewerName = "Review Officer A",
    } = body;

    if (!parcelId || !geometry || !reason) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Parcel ID, geometry, and reason are required." } },
        { status: 400 }
      );
    }

    const parcel = await getParcelById(parcelId);
    if (!parcel) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Target parcel not found." } },
        { status: 404 }
      );
    }

    // Optimistic Concurrency Protection Rule 55
    if (expectedParentVersionId && parcel.currentVersionId !== expectedParentVersionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VERSION_MISMATCH_409",
            message: `Parent version mismatch. The parcel was modified by another officer (Expected ${expectedParentVersionId}, Current ${parcel.currentVersionId}). Please refresh before committing.`,
          },
        },
        { status: 409 }
      );
    }

    const verNum = parseInt(parcel.currentVersionId.split("-").pop() || "2") + 1;
    const newVersionId = `V-${parcel.parcelId.replace("P-", "")}-${verNum}`;

    const newVersion: ParcelVersion = {
      versionId: newVersionId,
      parcelId: parcel.parcelId,
      parentVersionId: parcel.currentVersionId,
      versionNumber: verNum,
      geometry,
      attributes: attributes || parcel.attributes,
      sourceIds: ["DIRECT_COMMIT"],
      evidenceSummary: [
        {
          sourceId: "DIRECT_COMMIT",
          sourceType: "REVIEWER_OVERRIDE",
          datasetName: "Direct Reviewer Custom Boundary Adjustment",
          weight: 1.0,
          description: reason,
          captureDate: new Date().toISOString().split("T")[0],
        },
      ],
      confidenceScore: 0.95,
      decision: "modify",
      reviewerId,
      reviewerName,
      reason,
      createdAt: Date.now(),
    };

    await createVersion(newVersion);

    await addAuditLog({
      parcelId,
      action: "VERSION_CREATED",
      actorId: reviewerId,
      actorName: reviewerName,
      actorRole: "review_officer",
      fromVersion: parcel.currentVersionId,
      toVersion: newVersionId,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: {
        versionId: newVersionId,
        parcelId,
      },
    });
  } catch (err: any) {
    console.error("Error committing version:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message || "Failed to commit version." } },
      { status: 500 }
    );
  }
}
