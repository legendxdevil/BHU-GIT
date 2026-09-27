export const USER_ROLES = {
  ADMIN: "admin",
  REVIEW_OFFICER: "review_officer",
  FIELD_OFFICER: "field_officer",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PARCEL_STATUS = {
  APPROVED: "approved",
  PENDING_REVIEW: "pending_review",
  CONFLICT: "conflict",
} as const;

export type ParcelStatus = (typeof PARCEL_STATUS)[keyof typeof PARCEL_STATUS];

export const CONFLICT_TYPES = {
  GEOMETRY: "GEOMETRY",
  ATTRIBUTE: "ATTRIBUTE",
  IDENTIFIER: "IDENTIFIER",
  TEMPORAL: "TEMPORAL",
} as const;

export type ConflictType = (typeof CONFLICT_TYPES)[keyof typeof CONFLICT_TYPES];

export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type SeverityLevel = (typeof SEVERITY_LEVELS)[keyof typeof SEVERITY_LEVELS];

export const DECISION_ACTIONS = {
  APPROVE: "approve",
  REJECT: "reject",
  MODIFY: "modify",
  FIELD_CHECK: "field_check",
} as const;

export type DecisionAction = (typeof DECISION_ACTIONS)[keyof typeof DECISION_ACTIONS];

export const SOURCE_TYPES = {
  CADASTRAIL_MAP: "CADASTRAIL_MAP",
  GNSS_SURVEY: "GNSS_SURVEY",
  DRONE_ORTHOPHOTO: "DRONE_ORTHOPHOTO",
  MUNICIPAL_GIS: "MUNICIPAL_GIS",
  REVENUE_RECORD: "REVENUE_RECORD",
  LEGACY_SCAN: "LEGACY_SCAN",
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

export const CONFLICT_THRESHOLDS = {
  BOUNDARY_DEVIATION_METERS: 1.5,
  AREA_DIFFERENCE_PERCENT: 2.0,
  CANDIDATE_SEARCH_RADIUS_METERS: 100,
};
