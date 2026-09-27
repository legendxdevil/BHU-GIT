import { NextRequest, NextResponse } from "next/server";
import { validateUploadedFile } from "@/lib/validation/upload";
import { createSourceRecord, getParcels, createConflict, addAuditLog } from "@/lib/firebase/firestore";
import { analyzeConflict } from "@/lib/geo/conflict";
import { SourceRecord } from "@/types/source";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const datasetName = (formData.get("datasetName") as string) || "Uploaded Dataset";
    const sourceType = (formData.get("sourceType") as any) || "GNSS_SURVEY";
    const captureDate = (formData.get("captureDate") as string) || new Date().toISOString().split("T")[0];
    const coverageWard = (formData.get("coverageWard") as string) || "Ward 12";
    const uploadedBy = (formData.get("uploadedBy") as string) || "officer_101";
    const uploadedByName = (formData.get("uploadedByName") as string) || "Field Officer A";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_FILE", message: "No source file uploaded." } },
        { status: 400 }
      );
    }

    // 1. File & Extension Validation
    const validation = validateUploadedFile({ name: file.name, size: file.size, type: file.type });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_FILE", message: validation.error } },
        { status: 400 }
      );
    }

    // 2. Register Source Record
    const sourceId = `SRC-${Date.now().toString().slice(-6)}`;
    const sourceRecord: SourceRecord = {
      sourceId,
      sourceType,
      datasetName,
      uploadedBy,
      uploadedByName,
      uploadedAt: Date.now(),
      captureDate,
      coordinateReferenceSystem: "EPSG:4326 (WGS84)",
      coverageWard,
      fileType: validation.fileType,
      originalFileName: validation.sanitizedFileName,
      recordCount: 1,
      processingStatus: "completed",
      reliabilityScore: 0.92,
      historicalReviewsCount: 1,
      acceptedCount: 1,
    };

    await createSourceRecord(sourceRecord);

    // 3. Simulated GeoJSON / GNSS Spatial Feature Processing & Candidate Matching
    const parcels = await getParcels({ ward: coverageWard });
    let createdConflict = null;

    if (parcels.length > 0) {
      const targetParcel = parcels.find((p) => p.parcelId === "P-1003") || parcels[0];

      // Shift eastern boundary slightly by +0.00015 deg (~1.6m) to simulate incoming GNSS survey deviation
      const incomingCoords = JSON.parse(JSON.stringify(targetParcel.currentGeoJSON.coordinates));
      incomingCoords[0][1][0] += 0.00015;
      incomingCoords[0][2][0] += 0.00015;

      const incomingGeo = {
        type: "Polygon" as const,
        coordinates: incomingCoords,
      };

      const conflictId = `C-${Math.floor(100 + Math.random() * 900)}`;
      const conflict = analyzeConflict({
        conflictId,
        parcelId: targetParcel.parcelId,
        parcelNumber: targetParcel.parcelNumber,
        ward: targetParcel.ward,
        incomingGeometry: incomingGeo,
        currentGeometry: targetParcel.currentGeoJSON,
        incomingAttributes: {
          ...targetParcel.attributes,
          calculatedAreaSqM: (targetParcel.attributes.calculatedAreaSqM || 1240) + 21,
        },
        currentAttributes: targetParcel.attributes,
        sourceAId: "SRC-2019-CADASTRAIL",
        sourceAName: "Existing Revenue Cadastral Map",
        sourceBId: sourceRecord.sourceId,
        sourceBName: sourceRecord.datasetName,
      });

      createdConflict = await createConflict(conflict);
    }

    // 4. Record Audit Log
    await addAuditLog({
      action: "UPLOAD_SOURCE",
      actorId: uploadedBy,
      actorName: uploadedByName,
      actorRole: "field_officer",
      reason: `Ingested dataset [${datasetName}]. Triggered spatial candidate matching engine.`,
    });

    return NextResponse.json({
      success: true,
      data: {
        source: sourceRecord,
        conflict: createdConflict,
      },
    });
  } catch (err: any) {
    console.error("Error in POST /api/sources/upload:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message || "Upload processing error." } },
      { status: 500 }
    );
  }
}
