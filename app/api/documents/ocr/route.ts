import { NextRequest, NextResponse } from "next/server";
import { createDocument, addAuditLog } from "@/lib/firebase/firestore";
import { LegacyDocument } from "@/types/document";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string) || "Scanned Khasra Record";
    const docType = (formData.get("docType") as any) || "khasra";
    const parcelId = (formData.get("parcelId") as string) || "P-1003";

    const docId = `DOC-${Date.now().toString().slice(-6)}`;

    // Tesseract.js simulated OCR text & field candidate extraction engine
    const rawText = `REVENUE DEPARTMENT GOVT RECORD
Document Ref: ${docId}
Khasra No: 42/3
Ward: 12 (Central Zone)
Owner Name: Suresh Patel s/o Mohan Patel
Total Registered Area: 1240 Sq.Mtrs
Land Classification: Residential Abadi
Boundary Remarks: East side adjoins Nala road, West side adjoins Survey 42/1.`;

    const extractedFields = [
      { label: "Survey Number", key: "surveyNumber", extractedValue: "42/3", confidence: 0.98, isVerified: true },
      { label: "Ward Boundary", key: "ward", extractedValue: "Ward 12", confidence: 0.95, isVerified: true },
      { label: "Registered Owner", key: "ownerName", extractedValue: "Suresh Patel", confidence: 0.93, isVerified: true },
      { label: "Recorded Deed Area", key: "deedAreaSqM", extractedValue: "1240", confidence: 0.91, isVerified: true },
    ];

    const documentRecord: LegacyDocument = {
      documentId: docId,
      documentTitle: title,
      documentType: docType,
      fileName: `${docId}_scan.png`,
      uploadedBy: "officer_101",
      uploadedAt: Date.now(),
      processingStatus: "extracted",
      rawText,
      ocrConfidence: 0.92,
      extractedFields,
      associatedParcelId: parcelId,
      associatedSurveyNumber: "42/3",
    };

    await createDocument(documentRecord);

    await addAuditLog({
      parcelId,
      action: "RUN_OCR" as any,
      actorId: "officer_101",
      actorName: "Field Officer A",
      actorRole: "field_officer",
      reason: `Processed legacy document OCR for [${title}] attached to Parcel ${parcelId}.`,
    });

    return NextResponse.json({
      success: true,
      data: {
        document: documentRecord,
      },
    });
  } catch (err: any) {
    console.error("Error in POST /api/documents/ocr:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message || "OCR engine error." } },
      { status: 500 }
    );
  }
}
