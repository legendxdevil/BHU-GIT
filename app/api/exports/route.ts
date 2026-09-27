import { NextRequest, NextResponse } from "next/server";
import { getParcels, getConflicts, addAuditLog } from "@/lib/firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exportType = "geojson", ward = "Ward 12", requestedBy = "user_officer_81" } = body;

    const parcels = await getParcels({ ward: ward === "All Wards" ? undefined : ward });
    const conflicts = await getConflicts();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `BhuGit_${ward.replace(/\s+/g, "")}_${exportType.toUpperCase()}_${timestamp}.${exportType === "pdf" ? "json" : exportType}`;

    let payload: any = {};

    if (exportType === "geojson") {
      payload = {
        type: "FeatureCollection",
        name: `Bhu-Git Harmonized Land Records — ${ward}`,
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features: parcels.map((p) => ({
          type: "Feature",
          geometry: p.currentGeoJSON,
          properties: {
            parcelId: p.parcelId,
            parcelNumber: p.parcelNumber,
            status: p.status,
            currentVersionId: p.currentVersionId,
            ward: p.ward,
            ownerName: p.attributes.ownerName,
            landUse: p.attributes.landUse,
            calculatedAreaSqM: p.attributes.calculatedAreaSqM,
            updatedAt: p.updatedAt,
          },
        })),
      };
    } else if (exportType === "csv") {
      payload = {
        header: ["parcelId", "parcelNumber", "status", "currentVersionId", "ward", "ownerName", "landUse", "calculatedAreaSqM"],
        rows: parcels.map((p) => [
          p.parcelId,
          p.parcelNumber,
          p.status,
          p.currentVersionId,
          p.ward,
          p.attributes.ownerName || "",
          p.attributes.landUse || "",
          p.attributes.calculatedAreaSqM || 0,
        ]),
      };
    } else {
      payload = {
        title: `Bhu-Git Review Summary Report — ${ward}`,
        generatedAt: new Date().toISOString(),
        totalParcels: parcels.length,
        activeConflicts: conflicts.length,
        parcelsSummary: parcels.map((p) => ({
          id: p.parcelId,
          number: p.parcelNumber,
          status: p.status,
          version: p.currentVersionId,
        })),
      };
    }

    await addAuditLog({
      action: "EXPORT_CREATED",
      actorId: requestedBy,
      actorName: "Review Officer A",
      actorRole: "review_officer",
      reason: `Generated ${exportType.toUpperCase()} export package for ${ward}.`,
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        exportType,
        recordCount: parcels.length,
        payload,
      },
    });
  } catch (err: any) {
    console.error("Error in POST /api/exports:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message || "Export processing error." } },
      { status: 500 }
    );
  }
}
