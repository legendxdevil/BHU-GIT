import { SourceType } from "@/lib/constants";

export interface SourceRecord {
  sourceId: string;
  sourceType: SourceType;
  datasetName: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: number;
  captureDate: string;
  coordinateReferenceSystem: string;
  coverageWard?: string;
  fileType: string;
  originalFileName: string;
  recordCount: number;
  processingStatus: "uploaded" | "validating" | "standardizing" | "matched" | "completed" | "failed";
  reliabilityScore?: number; // aggregated source reliability factor [0.0 - 1.0]
  historicalReviewsCount?: number;
  acceptedCount?: number;
}
