import area from "@turf/area";
import bbox from "@turf/bbox";
import { GeoJSONPolygon } from "@/types/parcel";
import { polygon } from "@turf/helpers";

/**
 * Calculates area in square meters for a GeoJSON Polygon
 */
export function calculatePolygonAreaSqM(polyGeo: GeoJSONPolygon): number {
  try {
    if (!polyGeo || !polyGeo.coordinates || polyGeo.coordinates.length === 0) {
      return 0;
    }
    const turfPoly = polygon(polyGeo.coordinates);
    const areaSqM = area(turfPoly);
    return Math.round(areaSqM * 100) / 100;
  } catch (err) {
    console.error("Error calculating polygon area:", err);
    return 0;
  }
}

/**
 * Computes bounding box [minX, minY, maxX, maxY]
 */
export function getPolygonBoundingBox(polyGeo: GeoJSONPolygon): [number, number, number, number] {
  try {
    const turfPoly = polygon(polyGeo.coordinates);
    return bbox(turfPoly) as [number, number, number, number];
  } catch (err) {
    return [0, 0, 0, 0];
  }
}
