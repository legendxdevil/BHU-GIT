import { ParcelStatus } from "@/lib/constants";

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: number[];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONPolygon | GeoJSONPoint;
  properties: Record<string, any>;
}

export interface ParcelAttributes {
  surveyNumber: string;
  ward: string;
  zone?: string;
  ownerName?: string;
  landUse?: string;
  deedAreaSqM?: number;
  calculatedAreaSqM?: number;
  address?: string;
}

export interface ParcelRecord {
  parcelId: string;
  parcelNumber: string;
  status: ParcelStatus;
  currentVersionId: string;
  ward: string;
  zone?: string;
  currentGeoJSON: GeoJSONPolygon;
  attributes: ParcelAttributes;
  activeConflictId?: string | null;
  updatedAt: number;
  createdAt: number;
}
