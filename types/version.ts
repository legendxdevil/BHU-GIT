import { DecisionAction } from "@/lib/constants";
import { GeoJSONPolygon, ParcelAttributes } from "./parcel";

export interface EvidenceItem {
  sourceId: string;
  sourceType: string;
  datasetName: string;
  weight: number;
  description: string;
  captureDate: string;
}

export interface ParcelVersion {
  versionId: string;
  parcelId: string;
  parentVersionId: string | null;
  versionNumber: number;
  geometry: GeoJSONPolygon;
  attributes: ParcelAttributes;
  sourceIds: string[];
  evidenceSummary: EvidenceItem[];
  confidenceScore: number;
  decision: DecisionAction | "imported";
  reviewerId: string;
  reviewerName: string;
  reason: string;
  changesSummary?: {
    areaDeltaSqM?: number;
    maxBoundaryDeviationM?: number;
    changedAttributes?: string[];
  };
  createdAt: number;
}
