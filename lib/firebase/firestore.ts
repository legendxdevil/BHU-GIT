import { ParcelRecord } from "@/types/parcel";
import { ParcelVersion } from "@/types/version";
import { ParcelConflict } from "@/types/conflict";
import { SourceRecord } from "@/types/source";
import { LegacyDocument } from "@/types/document";
import { AuditLogEntry } from "@/types/audit";

import initialParcels from "@/data/demo/parcels.json";
import initialConflicts from "@/data/demo/conflicts.json";
import initialSources from "@/data/demo/sources.json";
import initialVersions from "@/data/demo/versions.json";
import initialDocuments from "@/data/demo/documents.json";
import initialAudits from "@/data/demo/audits.json";

// In-Memory Repository Store for Standalone Local Execution
let memoryParcels: ParcelRecord[] = [...(initialParcels as ParcelRecord[])];
let memoryConflicts: ParcelConflict[] = [...(initialConflicts as ParcelConflict[])];
let memorySources: SourceRecord[] = [...(initialSources as SourceRecord[])];
let memoryVersions: ParcelVersion[] = [...(initialVersions as ParcelVersion[])];
let memoryDocuments: LegacyDocument[] = [...(initialDocuments as LegacyDocument[])];
let memoryAudits: AuditLogEntry[] = [...(initialAudits as AuditLogEntry[])];

// --- PARCELS ---
export async function getParcels(filters?: { ward?: string; status?: string; search?: string }): Promise<ParcelRecord[]> {
  let list = [...memoryParcels];

  if (filters?.ward && filters.ward !== "All Wards") {
    list = list.filter((p) => p.ward === filters.ward);
  }
  if (filters?.status && filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.parcelId.toLowerCase().includes(q) ||
        p.parcelNumber.toLowerCase().includes(q) ||
        (p.attributes.ownerName && p.attributes.ownerName.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getParcelById(parcelId: string): Promise<ParcelRecord | null> {
  return memoryParcels.find((p) => p.parcelId === parcelId) || null;
}

export async function updateParcelRecord(parcelId: string, updates: Partial<ParcelRecord>): Promise<ParcelRecord> {
  const index = memoryParcels.findIndex((p) => p.parcelId === parcelId);
  if (index === -1) throw new Error("Parcel not found");

  memoryParcels[index] = {
    ...memoryParcels[index],
    ...updates,
    updatedAt: Date.now(),
  };
  return memoryParcels[index];
}

export async function createParcelRecord(parcel: ParcelRecord): Promise<ParcelRecord> {
  memoryParcels.unshift(parcel);
  return parcel;
}

// --- CONFLICTS ---
export async function getConflicts(status?: string): Promise<ParcelConflict[]> {
  if (status && status !== "all") {
    return memoryConflicts.filter((c) => c.status === status);
  }
  return [...memoryConflicts];
}

export async function getConflictById(conflictId: string): Promise<ParcelConflict | null> {
  return memoryConflicts.find((c) => c.conflictId === conflictId) || null;
}

export async function createConflict(conflict: ParcelConflict): Promise<ParcelConflict> {
  memoryConflicts.unshift(conflict);
  // Mark parcel status as conflict
  const parcel = await getParcelById(conflict.parcelId);
  if (parcel) {
    await updateParcelRecord(conflict.parcelId, {
      status: "conflict",
      activeConflictId: conflict.conflictId,
    });
  }
  return conflict;
}

export async function updateConflictStatus(conflictId: string, status: ParcelConflict["status"]): Promise<ParcelConflict> {
  const index = memoryConflicts.findIndex((c) => c.conflictId === conflictId);
  if (index === -1) throw new Error("Conflict not found");

  memoryConflicts[index] = {
    ...memoryConflicts[index],
    status,
    updatedAt: Date.now(),
  };

  if (status === "resolved") {
    await updateParcelRecord(memoryConflicts[index].parcelId, {
      activeConflictId: null,
      status: "approved",
    });
  }

  return memoryConflicts[index];
}

// --- VERSIONS ---
export async function getParcelVersions(parcelId: string): Promise<ParcelVersion[]> {
  return memoryVersions
    .filter((v) => v.parcelId === parcelId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function createVersion(version: ParcelVersion): Promise<ParcelVersion> {
  memoryVersions.unshift(version);

  // Update current parcel version reference
  await updateParcelRecord(version.parcelId, {
    currentVersionId: version.versionId,
    currentGeoJSON: version.geometry,
    attributes: version.attributes,
    status: "approved",
    activeConflictId: null,
  });

  return version;
}

// --- SOURCES ---
export async function getSources(): Promise<SourceRecord[]> {
  return [...memorySources];
}

export async function createSourceRecord(source: SourceRecord): Promise<SourceRecord> {
  memorySources.unshift(source);
  return source;
}

// --- DOCUMENTS ---
export async function getDocuments(): Promise<LegacyDocument[]> {
  return [...memoryDocuments];
}

export async function createDocument(doc: LegacyDocument): Promise<LegacyDocument> {
  memoryDocuments.unshift(doc);
  return doc;
}

// --- AUDIT LOGS ---
export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return [...memoryAudits].sort((a, b) => b.timestamp - a.timestamp);
}

export async function addAuditLog(entry: Omit<AuditLogEntry, "logId" | "timestamp">): Promise<AuditLogEntry> {
  const log: AuditLogEntry = {
    ...entry,
    logId: `LOG-${Date.now()}`,
    timestamp: Date.now(),
  };
  memoryAudits.unshift(log);
  return log;
}

// --- RESET DEMO ---
export async function resetDemoData(): Promise<void> {
  memoryParcels = [...(initialParcels as ParcelRecord[])];
  memoryConflicts = [...(initialConflicts as ParcelConflict[])];
  memorySources = [...(initialSources as SourceRecord[])];
  memoryVersions = [...(initialVersions as ParcelVersion[])];
  memoryDocuments = [...(initialDocuments as LegacyDocument[])];
  memoryAudits = [...(initialAudits as AuditLogEntry[])];
}
