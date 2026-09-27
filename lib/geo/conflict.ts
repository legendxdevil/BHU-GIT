import { GeoJSONPolygon, ParcelAttributes } from "@/types/parcel";
import { ConflictMeasurements, HarmonizationProposal, ParcelConflict } from "@/types/conflict";
import { CONFLICT_THRESHOLDS, CONFLICT_TYPES, SEVERITY_LEVELS, ConflictType, SeverityLevel } from "../constants";
import { calculatePolygonAreaSqM } from "./area";
import { calculateMaxBoundaryDeviationMeters } from "./distance";
import { calculatePolygonOverlap } from "./overlap";

export function analyzeConflict(params: {
  conflictId: string;
  parcelId: string;
  parcelNumber: string;
  ward: string;
  incomingGeometry: GeoJSONPolygon;
  currentGeometry: GeoJSONPolygon;
  incomingAttributes: ParcelAttributes;
  currentAttributes: ParcelAttributes;
  sourceAId: string;
  sourceAName: string;
  sourceBId: string;
  sourceBName: string;
}): ParcelConflict {
  const {
    conflictId,
    parcelId,
    parcelNumber,
    ward,
    incomingGeometry,
    currentGeometry,
    incomingAttributes,
    currentAttributes,
    sourceAId,
    sourceAName,
    sourceBId,
    sourceBName,
  } = params;

  // 1. Calculate Spatial Metrics
  const areaCurrent = calculatePolygonAreaSqM(currentGeometry);
  const areaIncoming = calculatePolygonAreaSqM(incomingGeometry);
  const areaDiffSqM = Math.abs(areaCurrent - areaIncoming);
  const areaDiffPercent = areaCurrent > 0 ? (areaDiffSqM / areaCurrent) * 100 : 0;

  const maxDevM = calculateMaxBoundaryDeviationMeters(currentGeometry, incomingGeometry);
  const { overlapRatio } = calculatePolygonOverlap(currentGeometry, incomingGeometry);

  // 2. Calculate Attribute Discrepancies
  const discrepantAttributes: Array<{ field: string; valueA: any; valueB: any }> = [];
  const fieldsToCheck: (keyof ParcelAttributes)[] = [
    "landUse",
    "ownerName",
    "surveyNumber",
    "deedAreaSqM",
  ];

  for (const field of fieldsToCheck) {
    const valA = currentAttributes[field];
    const valB = incomingAttributes[field];
    if (valA && valB && String(valA).toLowerCase() !== String(valB).toLowerCase()) {
      discrepantAttributes.push({ field, valueA: valA, valueB: valB });
    }
  }

  // 3. Classify Primary Conflict Type
  let conflictType: ConflictType = CONFLICT_TYPES.GEOMETRY;
  if (discrepantAttributes.length > 0 && maxDevM < CONFLICT_THRESHOLDS.BOUNDARY_DEVIATION_METERS) {
    conflictType = CONFLICT_TYPES.ATTRIBUTE;
  } else if (
    discrepantAttributes.some((d) => d.field === "surveyNumber") &&
    overlapRatio > 0.85
  ) {
    conflictType = CONFLICT_TYPES.IDENTIFIER;
  }

  // 4. Assign Severity
  let severity: SeverityLevel = SEVERITY_LEVELS.LOW;
  if (
    maxDevM > CONFLICT_THRESHOLDS.BOUNDARY_DEVIATION_METERS * 2 ||
    areaDiffPercent > CONFLICT_THRESHOLDS.AREA_DIFFERENCE_PERCENT * 2.5 ||
    discrepantAttributes.length > 1
  ) {
    severity = SEVERITY_LEVELS.HIGH;
  } else if (
    maxDevM > CONFLICT_THRESHOLDS.BOUNDARY_DEVIATION_METERS ||
    areaDiffPercent > CONFLICT_THRESHOLDS.AREA_DIFFERENCE_PERCENT ||
    discrepantAttributes.length === 1
  ) {
    severity = SEVERITY_LEVELS.MEDIUM;
  }

  // 5. Generate Harmonization Proposal
  const explanationReasons: string[] = [];

  if (maxDevM > 0) {
    explanationReasons.push(
      `Incoming dataset boundary deviates by ${maxDevM.toFixed(1)}m on perimeter edges.`
    );
  }
  if (areaDiffSqM > 0) {
    explanationReasons.push(
      `Calculated area differs by ${areaDiffSqM.toFixed(1)} sq.m (${areaDiffPercent.toFixed(1)}%).`
    );
  }
  if (discrepantAttributes.length > 0) {
    discrepantAttributes.forEach((d) => {
      explanationReasons.push(
        `Attribute mismatch in [${d.field}]: Current is "${d.valueA}", Incoming claims "${d.valueB}".`
      );
    });
  }

  // Proposed geometry defaults to incoming GNSS/Drone geometry when spatial quality is higher
  const proposal: HarmonizationProposal = {
    proposedGeometry: incomingGeometry,
    proposedAttributes: {
      ...currentAttributes,
      ...incomingAttributes,
    },
    explanationReasons,
    confidenceScore: Math.max(0.4, Math.min(0.95, 1 - maxDevM * 0.1 - areaDiffPercent * 0.02)),
    supportingSourceIds: [sourceBId],
  };

  const measurements: ConflictMeasurements = {
    areaDifferenceSqM: Math.round(areaDiffSqM * 10) / 10,
    areaDifferencePercent: Math.round(areaDiffPercent * 10) / 10,
    maxBoundaryDeviationM: Math.round(maxDevM * 10) / 10,
    shapeOverlapRatio: overlapRatio,
    discrepantAttributes,
  };

  const now = Date.now();

  return {
    conflictId,
    parcelId,
    parcelNumber,
    ward,
    conflictType,
    sourceAId,
    sourceAName,
    sourceBId,
    sourceBName,
    incomingGeometry,
    currentGeometry,
    measurements,
    proposal,
    severity,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}
