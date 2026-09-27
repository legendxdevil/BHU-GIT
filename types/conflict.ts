import { ConflictType, SeverityLevel } from "@/lib/constants";
import { GeoJSONPolygon } from "./parcel";

export interface ConflictMeasurements {
  areaDifferenceSqM?: number;
  areaDifferencePercent?: number;
  maxBoundaryDeviationM?: number;
  shapeOverlapRatio?: number;
  discrepantAttributes?: Array<{
    field: string;
    valueA: any;
    valueB: any;
  }>;
}

export interface HarmonizationProposal {
  proposedGeometry: GeoJSONPolygon;
  proposedAttributes: Record<string, any>;
  explanationReasons: string[];
  confidenceScore: number;
  supportingSourceIds: string[];
}

export interface ParcelConflict {
  conflictId: string;
  parcelId: string;
  parcelNumber: string;
  ward: string;
  conflictType: ConflictType;
  sourceAId: string;
  sourceAName: string;
  sourceBId: string;
  sourceBName: string;
  incomingGeometry: GeoJSONPolygon;
  currentGeometry: GeoJSONPolygon;
  measurements: ConflictMeasurements;
  proposal: HarmonizationProposal;
  severity: SeverityLevel;
  status: "pending" | "in_review" | "resolved" | "rejected";
  assignedTo?: string | null;
  createdAt: number;
  updatedAt: number;
}
