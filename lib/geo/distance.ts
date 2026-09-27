import pointToLineDistance from "@turf/point-to-line-distance";
import { point, polygon, lineString } from "@turf/helpers";
import { GeoJSONPolygon } from "@/types/parcel";

/**
 * Measures maximum boundary displacement (in meters) between two polygons
 */
export function calculateMaxBoundaryDeviationMeters(
  polyA: GeoJSONPolygon,
  polyB: GeoJSONPolygon
): number {
  try {
    const coordsA = polyA.coordinates[0];
    const coordsB = polyB.coordinates[0];

    if (!coordsA || !coordsB || coordsA.length < 3 || coordsB.length < 3) {
      return 0;
    }

    const lineB = lineString(coordsB);
    let maxDistance = 0;

    // Measure distance of each vertex of PolyA to closest edge of PolyB
    for (const ptCoord of coordsA) {
      const pt = point(ptCoord);
      const distKm = pointToLineDistance(pt, lineB, { units: "kilometers" });
      const distM = distKm * 1000;
      if (distM > maxDistance) {
        maxDistance = distM;
      }
    }

    return Math.round(maxDistance * 100) / 100;
  } catch (err) {
    console.error("Error calculating boundary deviation:", err);
    return 0;
  }
}
