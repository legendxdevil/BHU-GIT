const assert = require("assert");

console.log("=== Bhu-Git Test Suite Execution ===");

// 1. Test Spatial Math (Turf.js)
const { calculatePolygonAreaSqM } = require("../lib/geo/area");
const mockPoly = {
  type: "Polygon",
  coordinates: [
    [
      [77.2012, 28.6012],
      [77.2021, 28.6012],
      [77.2021, 28.6021],
      [77.2012, 28.6021],
      [77.2012, 28.6012],
    ],
  ],
};
const calculatedArea = calculatePolygonAreaSqM(mockPoly);
assert(calculatedArea > 0, "Polygon area calculation failed");
console.log("✔ Spatial Area Test Passed:", calculatedArea, "sq.m");

// 2. Test Multi-Dimensional Conflict Engine
const { analyzeConflict } = require("../lib/geo/conflict");
const conflict = analyzeConflict({
  conflictId: "TEST-C1",
  parcelId: "P-1003",
  parcelNumber: "42/3",
  ward: "Ward 12",
  incomingGeometry: {
    type: "Polygon",
    coordinates: [
      [
        [77.2012, 28.6022],
        [77.20225, 28.6022],
        [77.20225, 28.6033],
        [77.2012, 28.6033],
        [77.2012, 28.6022],
      ],
    ],
  },
  currentGeometry: mockPoly,
  incomingAttributes: { surveyNumber: "42/3", ownerName: "Test Owner" },
  currentAttributes: { surveyNumber: "42/3", ownerName: "Test Owner" },
  sourceAId: "SRC-1",
  sourceAName: "Source A",
  sourceBId: "SRC-2",
  sourceBName: "Source B",
});

assert.strictEqual(conflict.parcelId, "P-1003");
assert(conflict.measurements.maxBoundaryDeviationM > 0, "Boundary deviation measurement failed");
console.log("✔ Conflict Engine Test Passed. Max Boundary Dev:", conflict.measurements.maxBoundaryDeviationM, "m");

// 3. Test Evidence Trust Score Calculation
const { calculateEvidenceTrustScore } = require("../lib/geo/evidence");
const score = calculateEvidenceTrustScore({
  sourceReliability: 0.94,
  recencyDays: 30,
  spatialAgreementRatio: 0.9,
  attributeAgreementRatio: 1.0,
});
assert(score >= 0.8 && score <= 1.0, "Evidence trust score calculation out of bounds");
console.log("✔ Evidence Trust Score Test Passed. Calculated Trust Score:", score);

// 4. Test File Upload Validation
const { validateUploadedFile } = require("../lib/validation/upload");
const validCheck = validateUploadedFile({ name: "ward12_survey.geojson", size: 1024 * 500 });
assert.strictEqual(validCheck.valid, true);
assert.strictEqual(validCheck.fileType, "geojson");

const invalidCheck = validateUploadedFile({ name: "malicious.exe", size: 1024 });
assert.strictEqual(invalidCheck.valid, false);
console.log("✔ Upload File Validation Test Passed.");

console.log("\n==========================================");
console.log("ALL 4 TEST SUITES COMPLETED SUCCESSFULLY! ");
console.log("==========================================");
