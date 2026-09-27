import { DecisionAction } from "@/lib/constants";
import { GeoJSONPolygon, ParcelAttributes } from "./parcel";

export interface ReviewSession {
  parcelId: string;
  conflictId: string;
  activeReviewerId: string | null;
  activeReviewerName: string | null;
  lockedAt: number | null;
  draftGeometry?: GeoJSONPolygon | null;
  draftAttributes?: ParcelAttributes | null;
  draftNotes?: string;
  updatedAt: number;
}

export interface ReviewSubmissionPayload {
  conflictId: string;
  parcelId: string;
  action: DecisionAction;
  reviewerId: string;
  reviewerName: string;
  reason: string;
  modifiedGeometry?: GeoJSONPolygon;
  modifiedAttributes?: ParcelAttributes;
}
