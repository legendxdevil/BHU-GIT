import intersect from "@turf/intersect";
import area from "@turf/area";
import { polygon, featureCollection } from "@turf/helpers";
import { GeoJSONPolygon } from "@/types/parcel";

/**
 * Calculates overlap ratio [0.0 - 1.0] and intersection area between two polygons
 */
export function calculatePolygonOverlap(
  polyA: GeoJSONPolygon,
  polyB: GeoJSONPolygon
): { overlapRatio: number; intersectionAreaSqM: number } {
  try {
    const tPolyA = polygon(polyA.coordinates);
    const tPolyB = polygon(polyB.coordinates);

    const areaA = area(tPolyA);
    const areaB = area(tPolyB);

    const intersection = intersect(featureCollection([tPolyA, tPolyB]));

    if (!intersection) {
      return { overlapRatio: 0, intersectionAreaSqM: 0 };
    }

    const intersectionAreaSqM = area(intersection);
    const minArea = Math.min(areaA, areaB);
    const overlapRatio = minArea > 0 ? intersectionAreaSqM / minArea : 0;

    return {
      overlapRatio: Math.round(overlapRatio * 1000) / 1000,
      intersectionAreaSqM: Math.round(intersectionAreaSqM * 100) / 100,
    };
  } catch (err) {
    console.error("Error calculating polygon overlap:", err);
    return { overlapRatio: 0, intersectionAreaSqM: 0 };
  }
}
