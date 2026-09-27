export interface AuditLogEntry {
  logId: string;
  parcelId?: string;
  action:
    | "LOGIN"
    | "UPLOAD_SOURCE"
    | "PROCESS_START"
    | "PROCESS_COMPLETE"
    | "CONFLICT_CREATED"
    | "REVIEW_OPENED"
    | "PROPOSAL_MODIFIED"
    | "APPROVED"
    | "REJECTED"
    | "FIELD_CHECK_REQUESTED"
    | "VERSION_CREATED"
    | "EXPORT_CREATED";
  actorId: string;
  actorName: string;
  actorRole: string;
  fromVersion?: string | null;
  toVersion?: string | null;
  reason?: string;
  details?: Record<string, any>;
  timestamp: number;
}
