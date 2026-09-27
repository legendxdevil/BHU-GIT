/**
 * Evidence Trust Score Calculator
 * Scores evidence strength based on source reliability, recency, and spatial/attribute agreement.
 */
export function calculateEvidenceTrustScore(params: {
  sourceReliability: number; // 0.0 - 1.0
  recencyDays: number;
  spatialAgreementRatio: number; // 0.0 - 1.0
  attributeAgreementRatio: number; // 0.0 - 1.0
}): number {
  const { sourceReliability, recencyDays, spatialAgreementRatio, attributeAgreementRatio } = params;

  // Recency decay factor
  const recencyFactor = Math.max(0.5, 1 - recencyDays / (365 * 5));

  const weightedScore =
    sourceReliability * 0.4 +
    recencyFactor * 0.2 +
    spatialAgreementRatio * 0.25 +
    attributeAgreementRatio * 0.15;

  return Math.round(Math.min(1.0, Math.max(0.1, weightedScore)) * 100) / 100;
}
